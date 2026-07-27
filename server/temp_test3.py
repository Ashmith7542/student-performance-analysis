import requests
print("Health:")
try:
    print(requests.get("http://127.0.0.1:5000/api/health").status_code)
except Exception as e:
    print(e)

print("Notes:")
print(requests.get("http://127.0.0.1:5000/api/notes").status_code)
