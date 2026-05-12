import sys
import os
from pathlib import Path
from google.cloud.firestore_v1.base_query import FieldFilter, Or

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def check_user(identifier):
    output_file = Path(__file__).resolve().parent / "debug_output.txt"
    with open(output_file, "w") as f:
        if db is None:
            f.write("Firebase not connected.\n")
            return

        f.write(f"Checking for identifier: {identifier}\n")
        users_ref = db.collection('users')
        
        # Try direct email query
        f.write("Trying direct email query...\n")
        docs = list(users_ref.where('email', '==', identifier.lower()).stream())
        f.write(f"Direct email query results: {len(docs)}\n")
        for d in docs:
            user_data = d.to_dict()
            f.write(f"Found: {user_data.get('email')} (ID: {d.id})\n")
            f.write(f"Username: {user_data.get('username')}\n")
            f.write(f"Role: {user_data.get('role')}\n")

        # Try Or filter query
        f.write("Trying Or filter query...\n")
        identifier_lower = identifier.strip().lower()
        or_filter = Or(filters=[
            FieldFilter('email', '==', identifier_lower),
            FieldFilter('username', '==', identifier_lower)
        ])
        try:
            docs = list(users_ref.where(filter=or_filter).stream())
            f.write(f"Or filter query results: {len(docs)}\n")
            for d in docs:
                f.write(f"Found via Or: {d.to_dict().get('email')} (ID: {d.id})\n")
        except Exception as e:
            f.write(f"Or filter query failed: {e}\n")

if __name__ == "__main__":
    check_user("admin@paperly.com")
