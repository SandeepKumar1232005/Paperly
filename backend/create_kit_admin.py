import os
import sys
import uuid
import datetime
from pathlib import Path
from passlib.hash import pbkdf2_sha256

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Initialize Supabase client
from database.connection import supabase
from database.repositories.users import UserRepository

def create_admin(email, username, password, name):
    if not supabase:
        print("CRITICAL: Supabase not connected.")
        return

    # Check if user already exists
    existing = UserRepository.get_by_email(email)
    if existing:
        print(f"User with email {email} already exists. Updating to ADMIN role...")
        UserRepository.update(existing['id'], {
            'role': 'ADMIN',
            'is_verified': True,
            'password': pbkdf2_sha256.hash(password)
        })
        print(f"User {email} updated to ADMIN successfully!")
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
        'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    UserRepository.create(new_user)
    print(f"Admin user created successfully!")
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Role: ADMIN")

if __name__ == "__main__":
    create_admin(
        email="kit27.cse306@gmail.com",
        username="kit27",
        password="Pass@123",
        name="Kit Admin"
    )

