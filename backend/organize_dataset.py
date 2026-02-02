import os
import shutil
import random
from PIL import Image

# Configuration
SOURCE_DIR = 'iam_words' # Folder where you extracted the IAM dataset (e.g., 'words')
DEST_DIR = 'dataset'
CLASSES = ['Neat', 'Cursive', 'Bold', 'Mixed']

def setup_dirs():
    for split in ['train', 'test']:
        for cls in CLASSES:
            os.makedirs(os.path.join(DEST_DIR, split, cls), exist_ok=True)

def organize():
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory '{SOURCE_DIR}' not found.")
        print("1. Download the IAM dataset.")
        print("2. Extract it so you have a folder of images.")
        print(f"3. Rename/Link that folder to '{SOURCE_DIR}' or update this script.")
        return

    # Find all images recursively
    all_images = []
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                all_images.append(os.path.join(root, file))

    print(f"Found {len(all_images)} images.")
    random.shuffle(all_images)

    for img_path in all_images:
        try:
            image = Image.open(img_path)
            image.show() # Opens in default image viewer
            
            print(f"\nClassify '{os.path.basename(img_path)}':")
            for i, cls in enumerate(CLASSES):
                print(f"{i+1}. {cls}")
            print("s. Skip")
            print("q. Quit")

            choice = input("Choice: ").strip().lower()

            if choice == 'q':
                break
            if choice == 's':
                continue
            
            if choice in ['1', '2', '3', '4']:
                cls = CLASSES[int(choice) - 1]
                # split 80/20 train/test randomly
                split = 'train' if random.random() > 0.2 else 'test'
                dest_path = os.path.join(DEST_DIR, split, cls, os.path.basename(img_path))
                
                shutil.copy(img_path, dest_path)
                print(f"Saved to {split}/{cls}")
            else:
                print("Invalid choice.")

        except Exception as e:
            print(f"Error processing image: {e}")

if __name__ == "__main__":
    setup_dirs()
    organize()
