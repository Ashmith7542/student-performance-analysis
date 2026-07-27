from database import db
import bcrypt
from datetime import datetime
from bson import ObjectId

users_collection = db["users"]
students_collection = db["students"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def find_user_by_email(email: str):
    return users_collection.find_one({"email": email})

def create_user(user_data: dict):
    try:
        user_data["password"] = hash_password(user_data["password"])
        user_data["created_at"] = datetime.utcnow().isoformat()
        result = users_collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data
    except Exception as e:
        print(f"Database error during user creation: {e}")
        raise e

def user_to_dict(user):
    if not user:
        return None
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "rollNumber": user.get("rollNumber"),
        "class": user.get("class"),
        "department": user.get("department"),
        "subject": user.get("subject"),
        "year": user.get("year"),
        "section": user.get("section"),
    }

def create_student(student_data: dict):
    try:
        student_data["created_at"] = datetime.utcnow().isoformat()
        result = students_collection.insert_one(student_data)
        student_data["_id"] = result.inserted_id
        return student_data
    except Exception as e:
        print(f"Database error during student creation: {e}")
        raise e

def find_student_by_id(student_id: str):
    try:
        return students_collection.find_one({"_id": ObjectId(student_id)})
    except Exception as e:
        print(f"Database error during student retrieval: {e}")
        raise e

def update_student_by_id(student_id: str, update_data: dict):
    try:
        return students_collection.update_one({"_id": ObjectId(student_id)}, {"$set": update_data})
    except Exception as e:
        print(f"Database error during student update: {e}")
        raise e

def delete_student_by_id(student_id: str):
    try:
        return students_collection.delete_one({"_id": ObjectId(student_id)})
    except Exception as e:
        print(f"Database error during student deletion: {e}")
        raise e

predictions_collection = db["predictions"]

def student_to_dict(student):
    if not student:
        return None
    return {
        "id": str(student["_id"]),
        "name": student.get("name"),
        "age": student.get("age"),
        "gender": student.get("gender"),
        "studyHours": student.get("studyHours"),
        "attendance": student.get("attendance"),
        "previousScores": student.get("previousScores", []),
        "class": student.get("class"),
        "email": student.get("email"),
        "created_at": student.get("created_at"),
    }

def create_prediction(prediction_data: dict):
    try:
        prediction_data["created_at"] = datetime.utcnow().isoformat()
        result = predictions_collection.insert_one(prediction_data)
        prediction_data["_id"] = result.inserted_id
        return prediction_data
    except Exception as e:
        print(f"Database error during prediction storage: {e}")
        raise e

def fetch_predictions(student_id=None):
    try:
        query = {"student_id": student_id} if student_id else {}
        return list(predictions_collection.find(query).sort("created_at", -1))
    except Exception as e:
        print(f"Database error during predictions retrieval: {e}")
        raise e

def prediction_to_dict(pred):
    if not pred:
        return None
    return {
        "id": str(pred["_id"]),
        "student_id": pred.get("student_id"),
        "prediction": pred.get("prediction"),
        "created_at": pred.get("created_at"),
    }

attendance_collection = db["attendance"]
notes_collection = db["notes"]
permissions_collection = db["permissions"]

def attendance_to_dict(att):
    if not att: return None
    return {
        "id": str(att["_id"]),
        "student_id": att.get("student_id"),
        "status": att.get("status"),
        "date": att.get("date"),
        "created_at": att.get("created_at")
    }

def note_to_dict(note):
    if not note: return None
    return {
        "id": str(note["_id"]),
        "title": note.get("title"),
        "subject": note.get("subject"),
        "description": note.get("description"),
        "file_url": note.get("file_url"),
        "uploaded_by": note.get("uploaded_by"),
        "created_at": note.get("created_at")
    }

def permission_to_dict(perm):
    if not perm: return None
    return {
        "id": str(perm["_id"]),
        "student_id": perm.get("student_id"),
        "student_name": perm.get("student_name"),
        "type": perm.get("type"),
        "reason": perm.get("reason"),
        "status": perm.get("status", "pending"),
        "date": perm.get("date"),
        "created_at": perm.get("created_at")
    }

timetables_collection = db["timetables"]

def timetable_to_dict(tt):
    if not tt: return None
    return {
        "id": str(tt["_id"]),
        "role": tt.get("role"), # "student" or "teacher"
        "class_name": tt.get("class_name"),
        "teacher_id": tt.get("teacher_id"),
        "day": tt.get("day"),
        "subject": tt.get("subject"),
        "time": tt.get("time"),
        "room": tt.get("room"),
        "created_at": tt.get("created_at")
    }

