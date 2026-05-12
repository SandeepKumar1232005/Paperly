import requests

def test_get_writers():
    url = "http://localhost:8000/api/users/?role=provider"
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Count: {len(data)}")
        for u in data:
            print(f"Name: {u.get('name')}, Role: {u.get('role')}, Style: {u.get('handwriting_style')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_writers()
