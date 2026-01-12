import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.authentication.models import User

User = get_user_model()

try:
    if not User.objects.filter(email='charlie@admin.com').exists():
        print("Creating admin user...")
        # Create superuser for full access
        User.objects.create_superuser('charlie@admin.com', 'password', first_name='Charlie', last_name='Admin', role='admin')
        print("Admin user created: charlie@admin.com / password")
    else:
        print("Admin user exists.")
        u = User.objects.get(email='charlie@admin.com')
        # Always update name and role
        u.first_name = 'Charlie'
        u.last_name = 'Admin'
        u.is_superuser = True
        u.role = 'admin'
        u.save()
        print("Updated existing user to Admin/Superuser with correct name.")

except Exception as e:
    print(f"Error: {e}")
