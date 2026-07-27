import requests

print("Health:")
print(requests.get("http://127.0.0.1:5000/api/health").status_code)

print("GET /api/notes:")
print(requests.get("http://127.0.0.1:5000/api/notes").status_code)

print("GET /api/notes/:")
print(requests.get("http://127.0.0.1:5000/api/notes/").status_code)

print("POST /api/notes:")
print(requests.post("http://127.0.0.1:5000/api/notes").status_code)

print("POST /api/notes/:")
print(requests.post("http://127.0.0.1:5000/api/notes/").status_code)
