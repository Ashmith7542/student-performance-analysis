import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/auth"

def test_register():
    payload = {
        "email": "testuser@example.com",
        "password": "password123",
        "name": "Test User",
        "role": "student",
        "rollNumber": "12345"
    }
    print(f"Testing registration with: {json.dumps(payload, indent=2)}")
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    test_register()
