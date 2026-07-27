import requests

# Register teacher
reg_res = requests.post("http://127.0.0.1:5000/api/auth/register", json={
    "name": "Test Teacher",
    "email": "testteacher@example.com",
    "password": "password",
    "role": "teacher",
    "department": "Science",
    "subject": "Physics"
})

print("Register:", reg_res.status_code, reg_res.text)

login_res = requests.post("http://127.0.0.1:5000/api/auth/login", json={
    "email": "testteacher@example.com",
    "password": "password",
    "role": "teacher"
})
print("Login:", login_res.status_code, login_res.text)

if login_res.status_code == 200:
    token = login_res.json()["data"]["token"]
    res = requests.post("http://127.0.0.1:5000/api/notes/", json={
        "title": "Test Note",
        "subject": "Physics",
        "description": "Test",
        "file_url": "http://something.com"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    print("Upload:", res.status_code, res.text)
