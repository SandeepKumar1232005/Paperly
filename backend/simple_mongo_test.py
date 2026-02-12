
import pymongo
print(f"PyMongo Version: {pymongo.__version__}", flush=True)
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

# Check if MONGO_URI is set
MONGO_URI = os.environ.get('MONGO_URI')
if not MONGO_URI:
    print("❌ MONGO_URI not found in .env")
    MONGO_URI = "mongodb://localhost:27017" # Fallback

print(f"Testing connection to: {MONGO_URI}")

try:
    print("Attempting connection with certifi...")
    client = pymongo.MongoClient(MONGO_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Connected successfully with certifi!")
except Exception as e:
    print(f"❌ Connection failed with certifi: {e}")
    try:
        print("Attempting connection with SSL disabled...")
        client = pymongo.MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ Connected successfully with SSL disabled!")
        
        db = client['paperly_db']
        print(f"Database: {db.name}")
        
        email = "sandeepkumarvk18@gmail.com"
        user = db.users.find_one({'email': email})
        if user:
            print(f"User found: {user.get('email')}")
            print(f"Password hash: {user.get('password')}")
        else:
            print("User NOT found")
            
    except Exception as e2:
        print(f"❌ Retry failed: {repr(e2)}", flush=True)

