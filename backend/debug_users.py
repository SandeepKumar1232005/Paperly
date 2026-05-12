import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def list_users():
    print("--- Users in Firestore ---")
    users_ref = db.collection('users')
    docs = users_ref.stream()
    
    count = 0
    for doc in docs:
        data = doc.to_dict()
        print(f"ID: {doc.id}")
        print(f"  Name: {data.get('name')}")
        print(f"  Email: {data.get('email')}")
        print(f"  Role: {data.get('role')}")
        print(f"  Style: {data.get('handwriting_style')}")
        print("-" * 20)
        count += 1
    
    print(f"Total users: {count}")

if __name__ == "__main__":
    list_users()
