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
        print(f"User with email {email} already exists.")
        return

    existing_username = UserRepository.get_by_email_or_username(username)
    if existing_username:
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
        email="admin@paperly.com",
        username="admin",
        password="adminpassword123",
        name="System Administrator"
    )

