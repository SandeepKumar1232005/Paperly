
import os
import sys
import django
from passlib.hash import pbkdf2_sha256

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django (not valid needed for utils.mongo but good practice if using models)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from utils.mongo import db

def check_user():
    if db is None:
        print("CRITICAL: MongoDB connection failed (db is None)")
        return

    email = "sandeepkumarvk18@gmail.com"
    print(f"Checking for user: {email}")
    
    user = db.users.find_one({'email': email})
    
    if user:
        print(f"User FOUND:")
        print(f"ID: {user.get('id')}")
        print(f"Username: {user.get('username')}")
        print(f"Email: {user.get('email')}")
        print(f"Role: {user.get('role')}")
        print(f"Password Hash: {user.get('password')[:20]}...")
        
        # Test a dummy password just to see if verify works (expected failure)
        # print("Testing dummy password 'password'...")
        # print(f"Verify 'password': {pbkdf2_sha256.verify('password', user['password'])}")
    else:
        print("User NOT FOUND")

if __name__ == "__main__":
    check_user()
