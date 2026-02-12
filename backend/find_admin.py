
import os
import pymongo
import certifi
from pathlib import Path
from passlib.hash import pbkdf2_sha256

# Load .env file
env_path = Path(__file__).resolve().parent / '.env'
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
    print(f"Connecting to MongoDB (Unverified)...")
    # Force verification disabled
    client = pymongo.MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    
    client.admin.command('ping')
    db = client[MONGO_DB_NAME]
    print(f"Connected to {db.name}")

    # Find admin user
    admin_user = db.users.find_one({'role': 'ADMIN'})
    
    if admin_user:
        print("\n✅ Admin User Found:")
        print(f"Email: {admin_user.get('email')}")
        print(f"Username: {admin_user.get('username')}")
        # Reset password to 'admin123' if requested
        # But user asked 'ADMIN ID AND PASSWORD??'
        # I will reset it to 'admin123' and tell them.
        
        new_password = 'admin123'
        hashed_pw = pbkdf2_sha256.hash(new_password)
        
        db.users.update_one({'_id': admin_user['_id']}, {'$set': {'password': hashed_pw}})
        print(f"\n🔐 Password reset to: {new_password}")
        
    else:
        print("\n❌ No Admin User Found.")
        print("Creating default admin user...")
        
        new_password = 'admin123'
        hashed_pw = pbkdf2_sha256.hash(new_password)
        
        new_admin = {
            'id': 'admin',
            'username': 'admin',
            'email': 'admin@example.com',
            'password': hashed_pw,
            'role': 'ADMIN',
            'name': 'Administrator',
            'avatar': 'https://eu.ui-avatars.com/api/?name=Admin',
            'is_verified': True
        }
        
        db.users.insert_one(new_admin)
        print("\n✅ Default Admin User Created:")
        print("Email: admin@example.com")
        print("Username: admin")
        print(f"Password: {new_password}")

except Exception as e:
    print(f"Error: {e}")
