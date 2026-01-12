import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(url, method="GET", data=None):
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}/{url}")
        else:
            response = requests.post(f"{BASE_URL}/{url}", json=data)
        
        print(f"{method} {url}: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error: {response.text}")
        return response.status_code
    except Exception as e:
        print(f"Exception calling {url}: {e}")
        return 0

print("--- Verifying Admin Features ---")

# 1. Communication
test_endpoint("communication/announcements/")
test_endpoint("communication/messages/")

# 2. Support
test_endpoint("support/tickets/")

# 3. Core Settings
test_endpoint("core/settings/")

# 4. Analytics
test_endpoint("analytics/dashboard/")

print("--- Done ---")
