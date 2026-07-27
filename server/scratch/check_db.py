from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/student_predictor"))
db = client.squash_db

print("--- USERS ---")
for user in db.users.find({"role": "student"}).limit(1):
    print(user)

print("\n--- TIMETABLES (LATEST) ---")
for tt in db.timetables.find().sort("created_at", -1).limit(5):
    print(tt)
