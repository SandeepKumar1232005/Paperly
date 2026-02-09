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

try:
    # Use certifi to provide valid CA bundle
    client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[MONGO_DB_NAME]
    # Test connection
    client.admin.command('ping')
    print(f"✅ Connected to MongoDB Atlas: {db.name}")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")
    db = None
