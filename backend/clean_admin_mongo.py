import os
import sys
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

try:
    client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client[MONGO_DB_NAME]
    client.admin.command('ping')
    
    users = list(db.users.find())
    seen_emails = set()
    duplicates = 0

    for u in users:
        email = u.get('email', '').strip().lower()
        if not email:
            continue
        if email in seen_emails:
            print(f"Removing duplicate user: {email} (ID: {u.get('id')})")
            db.users.delete_one({'_id': u['_id']})
            duplicates += 1
        else:
            seen_emails.add(email)

    print(f"Removed {duplicates} duplicate users.")

except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
