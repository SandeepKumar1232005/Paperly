import os
import sys
from pathlib import Path
from passlib.hash import pbkdf2_sha256

backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def reset_passwords():
    users_ref = db.collection('users')
    hashed = pbkdf2_sha256.hash("Pass@123")
    
    for email in ["kit27.cse304@gmail.com", "kit27.cse02@gmail.com"]:
        docs = list(users_ref.where("email", "==", email).stream())
        if docs:
            doc = docs[0]
            users_ref.document(doc.id).update({
                "password": hashed
            })
            print(f"Reset password for {email} to 'Pass@123'")
        else:
            print(f"Could not find user with email {email}")

if __name__ == "__main__":
    reset_passwords()
