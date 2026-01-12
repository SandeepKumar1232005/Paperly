import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def inspect_specific_user(query):
    User = get_user_model()
    # Try by username or email
    user = User.objects.filter(username__iexact=query).first() or \
           User.objects.filter(email__iexact=query).first()
    
    if user:
        print(f"ID: {user.id}")
        print(f"Username: '{user.username}'")
        print(f"Email: '{user.email}'")
        print(f"First Name: '{user.first_name}'")
        print(f"Last Name: '{user.last_name}'")
        print(f"Date Joined: {user.date_joined}")
    else:
        print(f"User '{query}' not found.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_specific_user(sys.argv[1])
    else:
        inspect_specific_user("alice@student.com")
