import os
import io
import json
import numpy as np
from PIL import Image, ImageStat
from pathlib import Path

# Configuration
CLASSES = ['Neat', 'Cursive', 'Bold', 'Mixed']
GEMINI_API_KEY = None

# Load .env for GEMINI_API_KEY
_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if _env_path.exists():
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')


def predict_with_gemini(image_file):
    """
    Use Google Gemini Vision AI to classify handwriting style.
    Returns: (style, confidence) or (None, None) on failure.
    """
    if not GEMINI_API_KEY:
        print("[Handwriting] No GEMINI_API_KEY set. Skipping Gemini analysis.")
        return None, None

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Read image bytes
        image_file.seek(0)
        img = Image.open(image_file)
        img_rgb = img.convert('RGB')

        # Resize if too large (max 1024px on longest side) to save tokens
        max_dim = 1024
        if max(img_rgb.size) > max_dim:
            ratio = max_dim / max(img_rgb.size)
            new_size = (int(img_rgb.size[0] * ratio), int(img_rgb.size[1] * ratio))
            img_rgb = img_rgb.resize(new_size, Image.LANCZOS)

        prompt = """Analyze this handwriting image and classify its style into EXACTLY ONE of these categories:

1. **Neat** - Clean, well-spaced, print-like letters with consistent sizing. Letters are clearly separated and easy to read.
2. **Cursive** - Flowing, connected letters with loops and curves. Letters join together in a continuous stroke. Script-like or calligraphic handwriting.
3. **Bold** - Thick, heavy strokes with strong ink presence. Letters appear dark and prominent. Written with pressure or thick pen/marker.
4. **Mixed** - A combination of styles, or handwriting that doesn't clearly fit one category.

IMPORTANT: Look carefully at these features:
- If letters are CONNECTED with loops and flowing strokes → Cursive
- If letters are thick/heavy but NOT connected → Bold
- If letters are clean, separated, and uniform → Neat
- If it's a mix → Mixed

Respond with ONLY a JSON object in this exact format (no markdown, no extra text):
{"style": "Cursive", "confidence": 0.95}

The confidence should be between 0.0 and 1.0 based on how clearly the handwriting matches the chosen style."""

        response = model.generate_content([prompt, img_rgb])

        # Parse the response
        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            # Remove first and last lines (```json and ```)
            lines = [l for l in lines if not l.strip().startswith('```')]
            response_text = '\n'.join(lines).strip()

        result = json.loads(response_text)
        style = result.get('style', 'Mixed')
        confidence = float(result.get('confidence', 0.5))

        # Validate the style is in our class list
        if style not in CLASSES:
            # Try case-insensitive matching
            style_lower = style.lower()
            matched = False
            for cls in CLASSES:
                if cls.lower() == style_lower:
                    style = cls
                    matched = True
                    break
            if not matched:
                style = 'Mixed'

        # Clamp confidence
        confidence = max(0.0, min(1.0, confidence))

        print(f"[Handwriting] Gemini classified as: {style} (confidence: {confidence:.2f})")
        return style, confidence

    except Exception as e:
        print(f"[Handwriting] Gemini analysis failed: {e}")
        return None, None


def predict_with_heuristics(image_file):
    """
    Basic image-feature heuristic fallback for handwriting classification.
    Uses stroke thickness, density, and edge analysis.
    Returns: (style, confidence)
    """
    try:
        image_file.seek(0)
        img = Image.open(image_file)
        img_gray = img.convert('L')
        img_resized = img_gray.resize((256, 256))

        img_array = np.array(img_resized)

        # Binarize (Otsu-like threshold)
        threshold = np.mean(img_array)
        binary = (img_array < threshold).astype(np.float32)

        # Feature 1: Ink density (ratio of dark pixels)
        ink_density = np.mean(binary)

        # Feature 2: Stroke thickness estimation
        # Use horizontal and vertical run-length of dark pixels
        h_runs = []
        for row in binary:
            run = 0
            for px in row:
                if px > 0.5:
                    run += 1
                else:
                    if run > 0:
                        h_runs.append(run)
                    run = 0
        avg_h_run = np.mean(h_runs) if h_runs else 0

        # Feature 3: Edge density (proxy for curves/connections)
        # Simple Sobel-like edge detection
        from PIL import ImageFilter
        img_resized_pil = Image.fromarray(img_array.astype(np.uint8))
        edges = img_resized_pil.filter(ImageFilter.FIND_EDGES)
        edge_array = np.array(edges)
        edge_density = np.mean(edge_array > 30) 

        # Feature 4: Vertical connectivity (cursive tends to have more horizontal continuity)
        v_runs = []
        for col_idx in range(binary.shape[1]):
            run = 0
            for row_idx in range(binary.shape[0]):
                if binary[row_idx, col_idx] > 0.5:
                    run += 1
                else:
                    if run > 0:
                        v_runs.append(run)
                    run = 0
        avg_v_run = np.mean(v_runs) if v_runs else 0

        # Classification logic based on features
        scores = {'Neat': 0.0, 'Cursive': 0.0, 'Bold': 0.0, 'Mixed': 0.0}

        # Bold: high ink density + thick strokes
        if ink_density > 0.25:
            scores['Bold'] += 0.4
        if avg_h_run > 8:
            scores['Bold'] += 0.3
            scores['Cursive'] += 0.1  # Long runs could also be cursive

        # Cursive: high edge density (lots of curves) + long horizontal runs + moderate ink
        if edge_density > 0.15:
            scores['Cursive'] += 0.3
        if avg_h_run > 5 and avg_h_run <= 8:
            scores['Cursive'] += 0.25
        if 0.10 < ink_density <= 0.25:
            scores['Cursive'] += 0.15

        # Neat: low-moderate ink density + short runs (separated letters) + moderate edges
        if ink_density <= 0.15:
            scores['Neat'] += 0.3
        if avg_h_run <= 5:
            scores['Neat'] += 0.25
        if edge_density <= 0.15:
            scores['Neat'] += 0.15

        # Mixed: when no category dominates
        max_score = max(scores.values())
        if max_score < 0.3:
            scores['Mixed'] += 0.5

        # Pick the winner
        best_style = max(scores, key=scores.get)
        confidence = min(0.75, max(0.35, scores[best_style]))  # Cap heuristic confidence

        print(f"[Handwriting] Heuristic classified as: {best_style} (confidence: {confidence:.2f})")
        print(f"  Features: ink_density={ink_density:.3f}, avg_h_run={avg_h_run:.1f}, "
              f"edge_density={edge_density:.3f}, avg_v_run={avg_v_run:.1f}")
        return best_style, confidence

    except Exception as e:
        print(f"[Handwriting] Heuristic analysis failed: {e}")
        return 'Mixed', 0.3


def predict_handwriting_style(image_file):
    """
    Predicts the handwriting style of the uploaded image.
    Uses Gemini Vision AI as primary, with heuristic fallback.
    Returns: (style, confidence) or (None, None)
    """
    # Try Gemini first
    style, confidence = predict_with_gemini(image_file)
    if style is not None:
        return style, confidence

    # Fallback to heuristic analysis
    print("[Handwriting] Falling back to heuristic analysis...")
    return predict_with_heuristics(image_file)
