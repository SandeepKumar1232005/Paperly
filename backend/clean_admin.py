import os
import sys
from pathlib import Path

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')

import django
django.setup()

from utils.mongo import db

if db is None:
    print("Database not connected!")
    sys.exit(1)

# Task 1: Remove duplicate users
users = list(db.users.find())
seen_emails = set()
duplicates = 0

for u in users:
    email = u.get('email', '').strip().lower()
    if not email:
        continue
    if email in seen_emails:
        print(f"Removing duplicate user: {email} (ID: {u.get('id')})")
        db.users.delete_one({'_id': u['_id']})
        duplicates += 1
    else:
        seen_emails.add(email)

print(f"Removed {duplicates} duplicate users.")

# Task 2: Remove handwriting fields from admin
try:
    result = db.users.update_one(
        {'email': 'charlie@admin.com'}, 
        {'$unset': {
            'handwriting_style': '', 
            'handwriting_confidence': '',
            'handwriting_sample_url': '',
            'handwriting_samples': ''
        }}
    )
    print(f'Modify count: {result.modified_count}')
except Exception as e:
    print(e)
