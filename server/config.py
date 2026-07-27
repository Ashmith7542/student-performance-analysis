import os
from dotenv import load_dotenv

load_dotenv()

_raw = os.getenv("MONGO_URI", "")
# Strip literal "/tls=true" if appended as a path (common mistake)
if "/tls=true" in _raw:
    _raw = _raw.replace("/tls=true", "")

if _raw.startswith("mongodb+srv://"):
    if "?" in _raw:
        if "retryWrites" not in _raw:
            _raw += "&retryWrites=true&w=majority"
    else:
        _raw += "?retryWrites=true&w=majority"

class Config:
    MONGO_URI = _raw or os.getenv("MONGO_URI", "mongodb://localhost:27017/squash_db")
    JWT_SECRET = os.getenv("JWT_SECRET", "defaultsecret")
    PORT = int(os.getenv("PORT", 5000))
