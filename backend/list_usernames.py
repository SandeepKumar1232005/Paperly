import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def list_usernames():
    output_file = Path(__file__).resolve().parent / "usernames_debug.txt"
    with open(output_file, "w") as f:
        if db is None:
            f.write("Firebase not connected.\n")
            return

        f.write("Listing all users in Firestore:\n")
        users_ref = db.collection('users')
        docs = list(users_ref.stream())
        f.write(f"Total users: {len(docs)}\n")
        for d in docs:
            user_data = d.to_dict()
            f.write(f"ID: {d.id} | Username: {user_data.get('username')} | Email: {user_data.get('email')} | Role: {user_data.get('role')}\n")

if __name__ == "__main__":
    list_usernames()
