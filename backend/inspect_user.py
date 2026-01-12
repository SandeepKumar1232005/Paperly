import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def inspect_latest_user():
    User = get_user_model()
    # Get the most recently joined user
    user = User.objects.order_by('-date_joined').first()
    
    if user:
        print(f"ID: {user.id}")
        print(f"Username: '{user.username}'")
        print(f"Email: '{user.email}'")
        print(f"First Name: '{user.first_name}'")
        print(f"Last Name: '{user.last_name}'")
        print(f"Date Joined: {user.date_joined}")
    else:
        print("No users found.")

if __name__ == "__main__":
    inspect_latest_user()
