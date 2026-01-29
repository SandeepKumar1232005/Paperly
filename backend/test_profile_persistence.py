
import requests
import json
import base64
import time

BASE_URL = 'http://localhost:8000/api/auth'

def run_test():
    print("--- Starting Profile Persistence Test ---")
    
    # 1. Register
    username = f"testuser_{int(time.time())}"
    email = f"{username}@example.com"
    password = "password123"
    print(f"1. Registering user: {username}")
    
    reg_payload = {
        "email": email,
        "password": password,
        "username": username,
        "name": "Test User",
        "role": "STUDENT"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/register/", json=reg_payload)
        if resp.status_code != 201:
            print(f"FAILED: Registration failed {resp.status_code}")
            print(resp.text)
            return
        print("   Registration Success.")
    except Exception as e:
        print(f"FAILED: Registration Exception {e}")
        return

    # 2. Login
    print("2. Logging in...")
    login_payload = {
        "email": email,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/login/", json=login_payload)
    if resp.status_code != 200:
        print(f"FAILED: Login failed {resp.status_code}")
        return
    
    data = resp.json()
    token = data.get('key')
    user_id = data['user']['id']
    print(f"   Login Success. Token obtained.")
    
    # 3. Update Profile (Avatar & Address)
    print("3. Updating Profile (Avatar & Address)...")
    mock_avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" # 1x1 red pixel
    update_payload = {
        "avatar": mock_avatar,
        "address": "123 Test St, Test City"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Correction: The view is mapped to /api/auth/user/
    resp = requests.patch(f"{BASE_URL}/user/", json=update_payload, headers=headers)
    
    if resp.status_code != 200:
        print(f"FAILED: Update failed {resp.status_code}")
        print(resp.text)
        return
    
    updated_data = resp.json()
    if updated_data.get('avatar') == mock_avatar and updated_data.get('address') == "123 Test St, Test City":
        print("   Update returned correct data immediately.")
    else:
        print("FAILED: Immediate update response did not match.")
        print(f"   Expected avatar len: {len(mock_avatar)}, Got: {len(updated_data.get('avatar', ''))}")
        print(f"   Expected address: '123 Test St, Test City', Got: {updated_data.get('address')}")

    # 4. Re-Login to verify persistence
    print("4. Re-Logging in to verify persistence...")
    resp = requests.post(f"{BASE_URL}/login/", json=login_payload)
    if resp.status_code != 200:
        print(f"FAILED: Re-Login failed {resp.status_code}")
        return
        
    final_data = resp.json()['user']
    
    # Verify Avatar
    if final_data.get('avatar') == mock_avatar:
         print("SUCCESS: Avatar persisted after re-login.")
    else:
         print("FAILED: Avatar NOT persisted.")
         print(f"   Got: {final_data.get('avatar')}")
         
    # Verify Address
    if final_data.get('address') == "123 Test St, Test City":
         print("SUCCESS: Address persisted after re-login.")
    else:
         print("FAILED: Address NOT persisted.")
         print(f"   Got: {final_data.get('address')}")

if __name__ == "__main__":
    run_test()
