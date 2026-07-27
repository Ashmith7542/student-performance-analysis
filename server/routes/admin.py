from flask import Blueprint, jsonify, request
from utils.auth_middleware import token_required, roles_required
from models import users_collection, user_to_dict
import csv
import io
import bcrypt
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@token_required
@roles_required(["admin"])
def get_all_users():
    """Admin-only route to view all registered users."""
    try:
        users = list(users_collection.find())
        return jsonify({
            "success": True,
            "message": "Users fetched successfully",
            "data": {"users": [user_to_dict(u) for u in users]}
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@admin_bp.route("/stats", methods=["GET"])
@token_required
@roles_required(["admin"])
def get_system_stats():
    """Admin-only route to view system-wide analytics."""
    try:
        total_users = users_collection.count_documents({})
        students_count = users_collection.count_documents({"role": "student"})
        teachers_count = users_collection.count_documents({"role": "teacher"})
        
        return jsonify({
            "success": True,
            "message": "System stats fetched",
            "data": {
                "total_users": total_users,
                "students": students_count,
                "teachers": teachers_count
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@admin_bp.route("/import-users", methods=["POST"])
@token_required
@roles_required(["admin"])
def import_users_csv():
    """Import users from a CSV file."""
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"success": False, "message": "Only CSV files are allowed"}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("utf-8"), newline=None)
        reader = csv.DictReader(stream)
        
        to_insert = []
        skipped = 0
        processed = 0

        for row in reader:
            processed += 1
            email = row.get("email")
            if not email:
                skipped += 1
                continue
            
            # Check for existing
            from models import users_collection
            if users_collection.find_one({"email": email}):
                skipped += 1
                continue
            
            # Prepare data
            # Hash password if provided, else default
            plain_pass = row.get("password") or "admin@123"
            hashed = bcrypt.hashpw(plain_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            # Prepare User Record
            record = {
                "name": row.get("name", "User"),
                "email": email,
                "password": hashed,
                "role": row.get("role", "student").lower(),
                "rollNumber": row.get("rollNumber") or row.get("roll_number") or "",
                "department": row.get("department") or "",
                "class": row.get("class") or "",
                "subject": row.get("subject") or "",
                "year": row.get("year") or "",
                "section": row.get("section") or "",
                "created_at": datetime.utcnow().isoformat()
            }
            to_insert.append(record)

            # If student, also create a record in students_collection for analytics
            if record["role"] == "student":
                from models import students_collection
                
                # Parse performance fields
                attendance = float(row.get("attendance", 75))
                studyHours = float(row.get("studyHours", 4) or row.get("study_hours", 4))
                age = int(row.get("age", 18))
                gender = row.get("gender", "Other")
                
                # Parse previous scores (expecting comma separated string)
                raw_scores = row.get("previousScores") or row.get("previous_scores") or "70,75,80"
                try:
                    prev_scores = [float(s.strip()) for s in str(raw_scores).split(",") if s.strip()]
                except:
                    prev_scores = [70, 75, 80]

                student_record = {
                    "name": record["name"],
                    "email": record["email"],
                    "attendance": attendance,
                    "studyHours": studyHours,
                    "age": age,
                    "gender": gender,
                    "previousScores": prev_scores,
                    "class": record["class"],
                    "created_at": record["created_at"]
                }
                students_collection.insert_one(student_record)

        if to_insert:
            users_collection.insert_many(to_insert)

        return jsonify({
            "success": True,
            "message": f"Import complete. {len(to_insert)} users added, {skipped} skipped.",
            "data": {
                "added": len(to_insert),
                "skipped": skipped,
                "total_processed": processed
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error parsing CSV: {str(e)}"}), 500

@admin_bp.route("/teachers", methods=["GET"])
@token_required
@roles_required(["admin"])
def get_teachers():
    """Fetch all teachers for assignment."""
    try:
        teachers = list(users_collection.find({"role": "teacher"}))
        return jsonify({
            "success": True,
            "data": {"teachers": [user_to_dict(t) for t in teachers]}
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@admin_bp.route("/assign-teacher", methods=["POST"])
@token_required
@roles_required(["admin"])
def assign_teacher():
    """Assign a teacher to a subject/class."""
    data = request.get_json()
    teacher_id = data.get("teacher_id")
    update_fields = {
        "subject": data.get("subject"),
        "class": data.get("class"),
        "department": data.get("department"),
        "year": data.get("year"),
        "section": data.get("section")
    }
    
    try:
        from bson import ObjectId
        users_collection.update_one(
            {"_id": ObjectId(teacher_id), "role": "teacher"},
            {"$set": update_fields}
        )
        return jsonify({"success": True, "message": "Teacher assigned successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@admin_bp.route("/timetable", methods=["POST"])
@token_required
@roles_required(["admin"])
def admin_create_timetable():
    """Admin-only timetable creation."""
    from models import timetables_collection, timetable_to_dict
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
        
    data["created_at"] = datetime.utcnow().isoformat()
    result = timetables_collection.insert_one(data)
    data["_id"] = result.inserted_id
    
    return jsonify({
        "success": True,
        "message": "Timetable created successfully",
        "data": {"timetable": timetable_to_dict(data)}
    }), 201

@admin_bp.route("/import-timetable", methods=["POST"])
@token_required
@roles_required(["admin"])
def import_timetable_csv():
    """Bulk import timetable entries from CSV with explicit role/class context."""
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    
    file = request.files['file']
    # Get metadata from form
    role = request.form.get("role", "student").lower()
    class_name = request.form.get("class_name", "").strip()
    form_teacher_id = request.form.get("teacher_id", "").strip()
    
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400

    try:
        from models import timetables_collection
        stream = io.StringIO(file.stream.read().decode("utf-8"), newline=None)
        reader = csv.DictReader(stream)
        
        # Normalize headers for detection
        header_map = {h.strip().lower(): h for h in reader.fieldnames} if reader.fieldnames else {}
        days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        
        # Determine if this is a matrix format (Days as columns)
        pivoted_days = [d for d in days_of_week if d in header_map]
        is_matrix = len(pivoted_days) > 1
        
        to_insert = []
        for raw_row in reader:
            if is_matrix:
                # Matrix Format: Time is the first column, subjects are under day columns
                time_val = raw_row.get(header_map.get("time", ""), "").strip()
                if not time_val: continue
                
                for d_key in pivoted_days:
                    subject_val = raw_row.get(header_map[d_key], "").strip()
                    if subject_val and subject_val.lower() != "break": # Optional: skip breaks
                        to_insert.append({
                            "role": role,
                            "class_name": class_name,
                            "day": d_key.capitalize(),
                            "time": time_val,
                            "subject": subject_val,
                            "room": "TBD",
                            "teacher_id": form_teacher_id,
                            "created_at": datetime.utcnow().isoformat()
                        })
            else:
                # Flat List Format: day, time, subject columns
                def g(key, default=""):
                    return raw_row.get(header_map.get(key, ""), "").strip() or default
                
                record = {
                    "role": role,
                    "class_name": class_name,
                    "day": g("day") or g("days"),
                    "time": g("time") or g("times"),
                    "subject": g("subject", "General Class"),
                    "room": g("room", "TBD"),
                    "teacher_id": g("teacher_id") or form_teacher_id,
                    "created_at": datetime.utcnow().isoformat()
                }
                if record["day"] and record["time"]:
                    to_insert.append(record)

        if to_insert:
            timetables_collection.insert_many(to_insert)
            return jsonify({
                "success": True,
                "message": f"Successfully parsed {role} timetable. {len(to_insert)} periods registered across multiple days.",
                "data": {"added": len(to_insert)}
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No valid data found. Ensure headers include 'Time' and days like 'Monday', 'Tuesday', etc."
            }), 400

    except Exception as e:
        return jsonify({"success": False, "message": f"Error parsing CSV: {str(e)}"}), 500


