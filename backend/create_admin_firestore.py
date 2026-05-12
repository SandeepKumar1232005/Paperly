import os
import sys
import uuid
import datetime
from pathlib import Path
from passlib.hash import pbkdf2_sha256

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def create_admin(email, username, password, name):
    if db is None:
        print("CRITICAL: Firebase not connected. Check your firebase-credentials.json.")
        return

    users_ref = db.collection('users')
    
    # Check if user already exists
    docs = list(users_ref.where('email', '==', email.lower()).stream())
    if docs:
        print(f"User with email {email} already exists.")
        return

    docs = list(users_ref.where('username', '==', username.lower()).stream())
    if docs:
        print(f"User with username {username} already exists.")
        return

    # Hash password
    hashed_password = pbkdf2_sha256.hash(password)
    user_id = str(uuid.uuid4())

    new_user = {
        'id': user_id,
        'email': email.lower(),
        'username': username.lower(),
        'password': hashed_password,
        'name': name,
        'role': 'ADMIN',
        'is_verified': True,
        'created_at': datetime.datetime.now(datetime.timezone.utc)
    }

    db.collection('users').document(user_id).set(new_user)
    print(f"Admin user created successfully!")
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Role: ADMIN")

if __name__ == "__main__":
    create_admin(
        email="admin@paperly.com",
        username="admin",
        password="adminpassword123",
        name="System Administrator"
    )
