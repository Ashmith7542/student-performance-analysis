import os
from datetime import datetime
import bcrypt
from database import db

def init_admin():
    """Initializes the default admin user if it doesn't exist."""
    print("[*] Checking for admin user...")
    try:
        users_collection = db["users"]
        admin_email = os.getenv("ADMIN_EMAIL", "admin@college.com")
        
        existing_admin = users_collection.find_one({"role": "admin"})
        if not existing_admin:
            print("[+] Creating default admin user...")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin@123")
            hashed_password = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            admin_data = {
                "name": "System Admin",
                "email": admin_email,
                "password": hashed_password,
                "role": "admin",
                "rollNumber": "ADMIN001",
                "created_at": datetime.utcnow().isoformat()
            }
            users_collection.insert_one(admin_data)
            print(f"[!] Admin created with email: {admin_email}")
        else:
            print(f"[*] Admin user already exists: {existing_admin.get('email')}")
    except Exception as e:
        print(f"[!] Could not initialize admin: {e}")
