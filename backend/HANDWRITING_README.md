# Handwriting Classification Feature

This module allows you to classify handwriting styles into: **Neat, Cursive, Bold, Mixed**.

## 1. Setup Data (One-Time)
Since no public dataset has these specific style labels, you must label a small set of images yourself.

1. **Download a Dataset**:
   - Recommended: [Handwriting Recognition](https://www.kaggle.com/datasets/landlord/handwriting-recognition) or any IAM dataset.
   - Extract the images into a folder named `iam_words` inside the `backend/` directory.

2. **Run the Labeling Tool**:
   ```bash
   cd backend
   python organize_dataset.py
   ```
   - A window will pop up showing an image.
   - Look at the terminal.
   - Type `1` for Neat, `2` for Cursive, `3` for Bold, `4` for Mixed.
   - Repeat for about 50-100 images per category.

## 2. Train the Model
Once you have organized images in `dataset/train` and `dataset/test`:

```bash
python train_cnn.py
```
This will generate a new `handwriting_model.h5`.

## 3. Usage (API)
The Django API is ready to use.

- **Endpoint**: `POST /api/handwriting/predict/`
- **Headers**: `Authorization: Bearer <YOUR_TOKEN>`
- **Body**: `form-data` with `image` file.

It returns:
```json
{
    "style": "Cursive",
    "confidence": 0.98
}
```
And automatically updates the `handwriting_style` field in the user's MongoDB profile.

## 4. Current State
- A **dummy model** is currently in place. The API works immediately but attempts to predict random/dummy values until you train a real model.
