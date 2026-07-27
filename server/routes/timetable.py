from flask import Blueprint, request, jsonify
from models import timetables_collection, timetable_to_dict
from utils.auth_middleware import token_required
from datetime import datetime

timetable_bp = Blueprint("timetable", __name__)

@timetable_bp.route("", strict_slashes=False, methods=["GET"])
@token_required
def get_timetable():
    role = request.args.get("role")
    class_name = request.args.get("class_name")
    teacher_id = request.args.get("teacher_id")
    
    query = {}
    if role: query["role"] = role
    if class_name: 
        # Create a flexible regex: "12C" -> "^ *1 *2 *C *$"
        # This matches "12C", "12 C", "1 2 C", etc.
        chars = [c for c in class_name.replace(" ", "").replace("&", ".*") if c]
        flexible_pattern = " *".join(chars)
        query["class_name"] = {"$regex": f"^ *{flexible_pattern} *$", "$options": "i"}
    if teacher_id: query["teacher_id"] = teacher_id
    
    records = list(timetables_collection.find(query).sort("day", 1))
    return jsonify({
        "success": True,
        "message": "Timetable fetched successfully",
        "data": {"timetables": [timetable_to_dict(r) for r in records]}
    }), 200

@timetable_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
def create_timetable():
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
