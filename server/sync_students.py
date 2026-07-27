from database import db
from datetime import datetime

def sync():
    users_col = db["users"]
    students_col = db["students"]
    
    print("[*] Starting sync...")
    students_in_users = list(users_col.find({"role": "student"}))
    print(f"[*] Found {len(students_in_users)} student users.")
    
    added = 0
    skipped = 0
    
    for u in students_in_users:
        # Check if already in students_col
        if students_col.find_one({"email": u["email"]}):
            skipped += 1
            continue
            
        # Create student record with default/available analytics data
        student_record = {
            "name": u["name"],
            "email": u["email"],
            "attendance": float(u.get("attendance", 75)),
            "studyHours": float(u.get("studyHours", 4) or u.get("study_hours", 4)),
            "age": int(u.get("age", 18)),
            "gender": u.get("gender", "Other"),
            "previousScores": [70, 75, 80], # Default scores
            "class": u.get("class", "11"),
            "created_at": u.get("created_at", datetime.utcnow().isoformat())
        }
        students_col.insert_one(student_record)
        
        # Also create a default prediction record so charts are not empty
        prediction_record = {
            "student_id": str(student_record["_id"]),
            "prediction": {
                "score": 75.0,
                "grade": "B+",
                "breakdown": {
                    "attendance_contribution": 22.5,
                    "study_hours_contribution": 15.0,
                    "previous_scores_contribution": 28.0,
                    "age_contribution": 9.5
                }
            },
            "created_at": student_record["created_at"]
        }
        db["predictions"].insert_one(prediction_record)
        
        added += 1
        
    print(f"[+] Sync complete. Added: {added}, Skipped: {skipped}")

if __name__ == "__main__":
    sync()
