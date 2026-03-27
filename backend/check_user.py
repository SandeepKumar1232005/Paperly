import sys
from pathlib import Path
from google.cloud.firestore_v1.base_query import FieldFilter, Or

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def check_user(identifier):
    if db is None:
        print("Firebase not connected.")
        return

    print(f"Checking for identifier: {identifier}")
    users_ref = db.collection('users')
    
    # Try direct email query
    print("Trying direct email query...")
    docs = list(users_ref.where('email', '==', identifier.lower()).stream())
    print(f"Direct email query results: {len(docs)}")
    for d in docs:
        print(f"Found: {d.to_dict().get('email')} (ID: {d.id})")

    # Try Or filter query
    print("Trying Or filter query...")
    identifier_lower = identifier.strip().lower()
    or_filter = Or(filters=[
        FieldFilter('email', '==', identifier_lower),
        FieldFilter('username', '==', identifier_lower)
    ])
    try:
        docs = list(users_ref.where(filter=or_filter).stream())
        print(f"Or filter query results: {len(docs)}")
    except Exception as e:
        print(f"Or filter query failed: {e}")

if __name__ == "__main__":
    check_user("admin@paperly.com")
