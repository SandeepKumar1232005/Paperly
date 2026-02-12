import os
import django
import sys
import os
import django
import sys
from passlib.hash import pbkdf2_sha256
from pymongo import MongoClient

# Setup Django for hashers
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

# Import shared DB connection
from utils.mongo import db

if db is None:
    print("Error: Could not connect to database (from utils.mongo)")
    sys.exit(1)

admin_email = 'charlie@admin.com'
user = db.users.find_one({'email': admin_email})

if user:
    print(f'Admin user found: {user["email"]}')
    # Update password to 'adminpassword' to be sure
    hashed_pw = pbkdf2_sha256.hash('adminpassword')
    db.users.update_one({'email': admin_email}, {'$set': {'password': hashed_pw, 'role': 'ADMIN'}})
    print('Admin password reset to: adminpassword')
else:
    print('Admin user NOT found. Creating...')
    password = 'adminpassword'
    hashed_pw = pbkdf2_sha256.hash(password)
    
    new_admin = {
        'id': 'admin-1',
        'email': admin_email,
        'username': 'admin',
        'password': hashed_pw,
        'name': 'Charlie Admin',
        'role': 'ADMIN',
        'is_verified': True,
        'handwriting_style': 'Cursive',
        'handwriting_confidence': 0.99,
        'handwriting_samples': [],
        'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        'availability_status': 'ONLINE'
    }
    
    # Check if id exists
    if db.users.find_one({'id': 'admin-1'}):
        import uuid
        new_admin['id'] = str(uuid.uuid4())
        
    db.users.insert_one(new_admin)
    print(f'Created admin user: {admin_email} / {password}')
