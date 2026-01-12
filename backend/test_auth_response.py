import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

def test_user_response():
    User = get_user_model()
    user = User.objects.order_by('-date_joined').first()
    
    if not user:
        print("No users found.")
        return

    print(f"Testing for user: {user.username} (ID: {user.id})")
    
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    response = client.get('/api/auth/user/')
    
    print("\nAPI Response Status:", response.status_code)
    print("API Response Body:")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_user_response()
