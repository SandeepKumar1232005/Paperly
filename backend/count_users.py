import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

count = User.objects.count()
print(f"--------------------------------")
print(f"Total Users in Database: {count}")
print(f"--------------------------------")

print("\nUser List:")
for u in User.objects.all():
    print(f"- ID: {u.id} | Email: {u.email} | Name: {u.first_name} {u.last_name} | Role: {u.role}")
