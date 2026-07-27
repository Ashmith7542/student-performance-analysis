import requests

BASE_URL = "http://127.0.0.1:5000/api/auth"

def test_invalid_json():
    print("Testing registration with invalid JSON...")
    try:
        # Sending a string that is not valid JSON
        headers = {'Content-Type': 'application/json'}
        response = requests.post(f"{BASE_URL}/register", data="not a json", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Content Type: {response.headers.get('Content-Type')}")
        print(f"Response Body: {response.text[:100]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_invalid_json()
