import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Delete all non-superuser accounts
count, _ = User.objects.filter(is_superuser=False).delete()

print(f"--------------------------------")
print(f"Deleted {count} users.")
print(f"Remaining Users (Admins): {User.objects.count()}")
print(f"--------------------------------")
