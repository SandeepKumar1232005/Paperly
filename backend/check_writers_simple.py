from utils.mongo import db
import sys

if db is None:
    print("Error: Could not connect to database")
    sys.exit(1)

print(f"Connected to DB: {db.name}")
print("-" * 20)
print("Checking for Writers (role='provider' or 'WRITER')...")

writers = list(db.users.find({'$or': [{'role': 'provider'}, {'role': 'WRITER'}]}))
print(f"Found {len(writers)} writers.")

for w in writers:
    print(f"Email: {w.get('email')}")
    print(f"Name: {w.get('name')}")
    print(f"Role: {w.get('role')}")
    print(f"Samples: {w.get('handwriting_samples')}")
    print("-" * 10)
