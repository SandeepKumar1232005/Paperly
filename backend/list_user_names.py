import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def list_users_names():
    User = get_user_model()
    users = User.objects.all()
    print(f"Total Users: {users.count()}")
    for u in users:
        print(f"ID: {u.id} | User: '{u.username}' | First: '{u.first_name}' | Last: '{u.last_name}' | Email: '{u.email}'")

if __name__ == "__main__":
    list_users_names()
