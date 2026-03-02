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
