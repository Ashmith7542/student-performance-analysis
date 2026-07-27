import requests
try:
    res = requests.get("http://127.0.0.1:5005/api/health")
    print("Health:", res.status_code, res.text)
    
    res = requests.get("http://127.0.0.1:5005/api/notes")
    print("Notes GET:", res.status_code, res.text)
except Exception as e:
    print(e)
