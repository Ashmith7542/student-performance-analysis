from flask import Blueprint, request, jsonify
from models import attendance_collection, attendance_to_dict
from utils.auth_middleware import token_required, roles_required
from datetime import datetime

attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.route("", strict_slashes=False, methods=["GET"])
@token_required
def get_attendance():
    student_id = request.args.get("student_id")
    query = {"student_id": student_id} if student_id else {}
    records = list(attendance_collection.find(query).sort("date", -1))
    return jsonify({
        "success": True,
        "message": "Attendance records fetched",
        "data": {"records": [attendance_to_dict(r) for r in records]}
    }), 200

@attendance_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
@roles_required(["teacher"])
def mark_attendance():
    data = request.get_json()
    if not data or "records" not in data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    # data["records"] should be list of {student_id, status, date}
    created_at = datetime.utcnow().isoformat()
    for record in data["records"]:
        record["created_at"] = created_at
        attendance_collection.insert_one(record)
        
    return jsonify({
        "success": True,
        "message": f"Attendance marked for {len(data['records'])} students",
        "data": {}
    }), 201
