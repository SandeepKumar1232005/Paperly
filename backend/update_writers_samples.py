from utils.mongo import db
import sys

if db is None:
    print("Error: Could not connect to database")
    sys.exit(1)

print(f"Connected to DB: {db.name}")

sample_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Einstein_signature_1934.svg/1200px-Einstein_signature_1934.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Marie_Curie_signature.svg/1200px-Marie_Curie_signature.svg.png"
]

writers = db.users.find({'$or': [{'role': 'provider'}, {'role': 'WRITER'}]})
count = 0
for w in writers:
    try:
        db.users.update_one(
            {'_id': w['_id']},
            {'$set': {'handwriting_samples': sample_urls}}
        )
        print(f"Updated writer: {w.get('email')}")
        count += 1
    except Exception as e:
        print(f"Failed to update {w.get('email')}: {e}")

print(f"Updated {count} writers with samples.")
