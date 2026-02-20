import os
import sys
from pathlib import Path

env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

import pymongo
import certifi

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'paperly_db')

print(f"Testing URI: {MONGO_URI}")

try:
    client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS 1")
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Attempting with tlsAllowInvalidCertificates=True")
    try:
        client = pymongo.MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("SUCCESS 2")
    except Exception as e2:
        traceback.print_exc()
