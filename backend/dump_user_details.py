import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def dump_writer_details():
    users_ref = db.collection('users')
    for email in ["kit27.cse304@gmail.com", "kit27.cse02@gmail.com"]:
        docs = list(users_ref.where("email", "==", email).stream())
        if docs:
            doc = docs[0]
            data = doc.to_dict()
            print(f"Name: {data.get('name')}")
            print(f"Email: {data.get('email')}")
            print(f"Role: {data.get('role')}")
            avatar = data.get('avatar', '')
            print(f"Avatar Type: {type(avatar)}")
            print(f"Avatar (first 100 chars): {avatar[:100]}")
            print(f"Avatar (last 50 chars): {avatar[-50:] if len(avatar) > 50 else ''}")
            print("-" * 50)

if __name__ == "__main__":
    dump_writer_details()
