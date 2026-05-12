import sys
from pathlib import Path
from passlib.hash import pbkdf2_sha256
import datetime
import uuid

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def seed_users():
    users_to_add = [
        {
            "email": "admin@paperly.com",
            "username": "admin",
            "password": "password123",
            "name": "Super Admin",
            "role": "ADMIN",
            "is_verified": True
        },
        {
            "email": "student@paperly.com",
            "username": "student1",
            "password": "password123",
            "name": "Jane Student",
            "role": "STUDENT",
            "is_verified": True
        },
        {
            "email": "writer@paperly.com",
            "username": "writer1",
            "password": "password123",
            "name": "John Writer",
            "role": "WRITER",
            "is_verified": True,
            "handwriting_style": "Cursive",
            "handwriting_confidence": 0.95
        }
    ]

    for user in users_to_add:
        # Check if exists
        users_ref = db.collection('users')
        docs = list(users_ref.where('email', '==', user['email']).stream())
        if docs:
            print(f"User {user['email']} already exists.")
            continue

        user_id = str(uuid.uuid4())
        hashed_password = pbkdf2_sha256.hash(user['password'])

        new_user = {
            'id': user_id,
            'email': user['email'],
            'username': user['username'],
            'password': hashed_password,
            'name': user['name'],
            'role': user['role'],
            'is_verified': user['is_verified'],
            'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        if 'handwriting_style' in user:
            new_user['handwriting_style'] = user['handwriting_style']
            new_user['handwriting_confidence'] = user['handwriting_confidence']

        db.collection('users').document(user_id).set(new_user)
        print(f"Created {user['role']}: {user['email']} (Password: {user['password']})")

if __name__ == "__main__":
    seed_users()
