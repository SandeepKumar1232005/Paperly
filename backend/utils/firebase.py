import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from pathlib import Path

# Load .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

db = None

try:
    # Try to load credentials from a file
    cred_path = Path(__file__).resolve().parent.parent / 'firebase-credentials.json'
    
    if cred_path.exists():
        cred = credentials.Certificate(str(cred_path))
        print("[Firebase] Initializing with firebase-credentials.json")
    else:
        # Fallback to Application Default Credentials if running in GCP, or emulator
        # Note: If no default credentials are found, this will raise a ValueError
        cred = credentials.ApplicationDefault()
        print("[Firebase] Initializing with Application Default Credentials")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    print("[Firebase] Firestore client initialized successfully.")
except Exception as e:
    print(f"[Firebase] CRITICAL ERROR initializing Firebase Admin SDK: {e}")
    print("[Firebase] Please ensure you have a valid firebase-credentials.json in the backend directory.")
    db = None
