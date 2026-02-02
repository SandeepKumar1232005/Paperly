import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import os

IMG_HEIGHT, IMG_WIDTH = 128, 128
CLASSES = ['Neat', 'Cursive', 'Bold', 'Mixed']
MODEL_PATH = 'handwriting_model.h5'

def create_and_save_dummy_model():
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_HEIGHT, IMG_WIDTH, 1)),
        MaxPooling2D(2, 2),
        Flatten(),
        Dense(len(CLASSES), activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy')
    model.save(MODEL_PATH)
    print(f"Dummy model saved to {MODEL_PATH}")

if __name__ == "__main__":
    create_and_save_dummy_model()
