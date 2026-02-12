import os
from pathlib import Path
import pymongo
import certifi

# Load .env manually
env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

MONGO_URI = os.environ.get('MONGO_URI')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'paperly_db')

print(f"Connecting to MongoDB: {MONGO_URI[:20]}...")

try:
    # Disable SSL verification for debugging
    client = pymongo.MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True)
    db = client[MONGO_DB_NAME]
    # Test connection
    client.admin.command('ping')
    print(f"✅ Connected to MongoDB Atlas: {db.name}")
    
    users = list(db.users.find())
    print(f"Total Users in MongoDB: {len(users)}")
    print("-" * 50)
    for user in users:
        print(f"Email: {user.get('email')}")
        print(f"Username: {user.get('username')}")
        print(f"Role: {user.get('role')}")
        # Print first few chars of hash to verify
        pw = user.get('password')
        print(f"Password Hash: {pw[:10] if pw else 'NO PASSWORD'}...")
        print("-" * 50)

except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")

