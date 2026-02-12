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
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'paperly_db')

print(f"DEBUG: Connecting to URI: {MONGO_URI[:15]}... DB: {MONGO_DB_NAME}")

try:
    # Try connecting with certifi
    client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=20000)
    # Force connection check
    client.admin.command('ping')
    db = client[MONGO_DB_NAME]
    print(f"Connected to MongoDB Atlas: {db.name}")
except Exception as e:
    print(f"WARNING: SSL Connection failed ({e}). Retrying with SSL verification disabled...")
    try:
        # Fallback: Disable SSL verification
        client = pymongo.MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[MONGO_DB_NAME]
        print(f"Connected to MongoDB Atlas (Unverified): {db.name}")
    except Exception as e2:
        print(f"ERROR: Error connecting to MongoDB: {e2}")
        db = None
