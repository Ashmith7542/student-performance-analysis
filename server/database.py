from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=30000)

try:
    client.admin.command("ping")
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"MongoDB connection warning: {e}")
    print("TIP: If using MongoDB Atlas, add your current IP to Network Access.")

try:
    db = client.get_default_database()
except Exception:
    db = None

if db is None:
    db = client["squash_db"]

