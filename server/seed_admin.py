import os
from datetime import datetime
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

# Load workspace .env
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@college.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin@123")
DB_NAME = "squash_db" # Matching your database.py logic

def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_admin():
    print("--- Admin Initialization ---")
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        users_collection = db["users"]

        # Check if admin already exists
        existing_admin = users_collection.find_one({"email": ADMIN_EMAIL})
        
        if existing_admin:
            print(f"[*] Admin already exists: {ADMIN_EMAIL}")
            # Optional: update password if needed
            choice = input("[?] Would you like to reset the admin password from .env? (y/n): ")
            if choice.lower() == 'y':
                users_collection.update_one(
                    {"email": ADMIN_EMAIL},
                    {"$set": {"password": hash_password(ADMIN_PASSWORD)}}
                )
                print("[+] Admin password updated successfully.")
            return

        # Prepare Admin Data
        admin_data = {
            "name": "System Administrator",
            "email": ADMIN_EMAIL,
            "password": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "rollNumber": "ADMIN001",
            "created_at": datetime.utcnow().isoformat()
        }

        # Insert Admin
        users_collection.insert_one(admin_data)
        print(f"[+] Default Admin created successfully: {ADMIN_EMAIL}")
        print("[!] Remember to secure your .env file in production.")

    except Exception as e:
        print(f"[!] Error creating admin: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    create_admin()
