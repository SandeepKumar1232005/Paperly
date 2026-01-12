import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def ensure_user(email, password, first, last, role, is_staff=False, is_superuser=False):
    try:
        if not User.objects.filter(email=email).exists():
            print(f"Creating user {email}...")
            # Using create_user for standard users, manually setting fields
            u = User.objects.create_user(
                username=email, 
                email=email, 
                password=password,
                first_name=first,
                last_name=last
            )
            # Custom fields need to be set after creation if create_user doesn't support them directly in kwargs depending on manager
            # But the custom user model probably supports extra fields if using the default manager correctly?
            # Safe bet is update after.
            u.role = role
            u.is_staff = is_staff
            u.is_superuser = is_superuser
            u.is_verified = True
            u.save()
            print(f"Created: {first} {last} ({role})")
        else:
            print(f"Updating user {email}...")
            u = User.objects.get(email=email)
            u.first_name = first
            u.last_name = last
            u.role = role
            u.is_staff = is_staff
            u.is_superuser = is_superuser
            u.is_verified = True
            u.save()
            print(f"Updated: {first} {last} ({role})")

    except Exception as e:
        print(f"Error for {email}: {e}")

# 1. Admin
ensure_user('charlie@admin.com', 'password', 'Charlie', 'Admin', 'admin', True, True)

# 2. Student
ensure_user('alice@student.com', 'password', 'Alice', 'Student', 'student')

# 3. Writer
ensure_user('bob@writer.com', 'password', 'Bob', 'Writer', 'provider') # role is 'provider' in backend usually

print("Demo users ensured.")
