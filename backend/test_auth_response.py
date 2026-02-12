import requests
import json
import sys

# Base URL
BASE_URL = 'http://localhost:8000/api/auth'

def test_auth_flow():
    email = 'charlie@admin.com'
    password = 'adminpassword'
    
    print(f"1. Attempting login as {email}...")
    
    login_url = f'{BASE_URL}/login/'
    try:
        response = requests.post(login_url, json={'email': email, 'password': password, 'username': email})
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        return

    print(f"Login Status: {response.status_code}")
    
    if response.status_code != 200:
        print("Login Failed:", response.text)
        # Try registering if login fails? No, keep it simple first.
        return

    data = response.json()
    token = data.get('key') or data.get('access') or data.get('token')
    
    if not token:
        print("Error: No token found in response:", data)
        return

    print("Login Successful. Token received.")
    
    print("\n2. Fetching User Details...")
    user_url = f'{BASE_URL}/user/'
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        user_response = requests.get(user_url, headers=headers)
        print(f"User Response Status: {user_response.status_code}")
        print("User Response Body:")
        print(json.dumps(user_response.json(), indent=2))
    except Exception as e:
        print(f"Error fetching user details: {e}")

if __name__ == "__main__":
    test_auth_flow()
