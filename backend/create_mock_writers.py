import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

writers_data = [
    {
        "email": "alan@writer.com",
        "first_name": "Alan",
        "last_name": "Turing",
        "role": "provider",
        "bio": "Expert in Computer Science and Cryptography.",
        "address": "Bletchley Park, UK"
    },
    {
        "email": "ada@writer.com",
        "first_name": "Ada",
        "last_name": "Lovelace",
        "role": "provider",
        "bio": "Specialized in Analytical Engine programming and Mathematics.",
        "address": "London, UK"
    },
    {
        "email": "grace@writer.com",
        "first_name": "Grace",
        "last_name": "Hopper",
        "role": "provider",
        "bio": "Pioneer in COBOL and compiler design.",
        "address": "Arlington, Virginia"
    }
]

created_count = 0
for data in writers_data:
    if not User.objects.filter(email=data["email"]).exists():
        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password="password123",
            first_name=data["first_name"],
            last_name=data["last_name"],
            role=data["role"],
            address=data["address"]
            # is_verified=True # Assuming model has this, checking types.ts it does, but checking backend model... 
            # I can't be sure if backend model has is_verified without checking, but sticking to basics.
        )
        print(f"Created writer: {user.email}")
        created_count += 1
    else:
        print(f"Writer already exists: {data['email']}")

print(f"--------------------------------")
print(f"Successfully added {created_count} writers.")
print(f"Total Users: {User.objects.count()}")
print(f"--------------------------------")
