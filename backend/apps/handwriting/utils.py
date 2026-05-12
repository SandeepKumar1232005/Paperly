import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'handwriting_model.h5')
CLASSES = ['Neat', 'Cursive', 'Bold', 'Mixed']
IMG_HEIGHT, IMG_WIDTH = 128, 128

_model = None

def get_model():
    global _model
    if _model is None:
        try:
            if os.path.exists(MODEL_PATH):
                _model = load_model(MODEL_PATH)
                print("Handwriting model loaded successfully.")
            else:
                print(f"Model file not found at {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    return _model

def preprocess_image(image_file):
    """
    Preprocess the uploaded image for the model.
    """
    try:
        img = Image.open(image_file)
        img = img.convert('L') # Grayscale
        img = img.resize((IMG_WIDTH, IMG_HEIGHT))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0 # Normalize
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

def predict_handwriting_style(image_file):
    """
    Predicts the handwriting style of the uploaded image.
    Returns: (style, confidence) or (None, None)
    """
    model = get_model()
    if model is None:
        return None, None

    processed_img = preprocess_image(image_file)
    if processed_img is None:
        return None, None

    try:
        predictions = model.predict(processed_img)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        style = CLASSES[class_idx]
        return style, confidence
    except Exception as e:
        print(f"Prediction error: {e}")
        return None, None
