import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model
from django.db.models import Q

def find_empty_names():
    User = get_user_model()
    # Check for empty string or null (though charfield usually not null)
    users = User.objects.filter(Q(first_name='') | Q(first_name__isnull=True))
    
    print(f"Users with empty First Name: {users.count()}")
    for u in users:
        print(f"ID: {u.id} | User: '{u.username}' | Email: '{u.email}'")

if __name__ == "__main__":
    find_empty_names()
