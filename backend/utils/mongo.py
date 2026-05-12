import pymongo
import os
import certifi
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

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
MONGO_LOCAL_URI = os.environ.get('MONGO_LOCAL_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'paperly_db')

db = None

# --- Attempt 1: MongoDB Atlas with certifi SSL ---
if MONGO_URI.startswith('mongodb+srv://') or 'mongodb.net' in MONGO_URI:
    print(f"[MongoDB] Attempting Atlas connection to: {MONGO_URI[:40]}...")
    try:
        client = pymongo.MongoClient(
            MONGO_URI, 
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        client.admin.command('ping')
        db = client[MONGO_DB_NAME]
        print(f"[MongoDB] Connected to Atlas: {db.name}")
    except Exception as e:
        print(f"[MongoDB] Atlas SSL connection failed: {e}")
        # --- Attempt 2: Atlas with SSL verification disabled ---
        try:
            client = pymongo.MongoClient(
                MONGO_URI, 
                tls=True, 
                tlsAllowInvalidCertificates=True, 
                serverSelectionTimeoutMS=5000
            )
            client.admin.command('ping')
            db = client[MONGO_DB_NAME]
            print(f"[MongoDB] Connected to Atlas (unverified SSL): {db.name}")
        except Exception as e2:
            print(f"[MongoDB] Atlas fallback also failed: {e2}")

# --- Attempt 3: Local MongoDB fallback ---
if db is None:
    print(f"[MongoDB] Trying local MongoDB at: {MONGO_LOCAL_URI}")
    try:
        client = pymongo.MongoClient(MONGO_LOCAL_URI, serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        db = client[MONGO_DB_NAME]
        print(f"[MongoDB] Connected to local MongoDB: {db.name}")
    except Exception as e3:
        print(f"[MongoDB] ERROR: Local MongoDB also unavailable: {e3}")
        print("[MongoDB] WARNING: No database connection. API endpoints will return errors.")
        db = None
else:
    # Atlas connected, skip local fallback
    pass

if db is not None:
    print(f"[MongoDB] Database ready: {db.name}")
else:
    print("[MongoDB] CRITICAL: No database connection established!")
