from flask import Blueprint, request, jsonify
from models import (
    students_collection, create_student, find_student_by_id, 
    update_student_by_id, delete_student_by_id, student_to_dict
)
from utils.auth_middleware import token_required, roles_required
from bson import ObjectId

students_bp = Blueprint("students", __name__)

@students_bp.route("", strict_slashes=False, methods=["GET"])
@token_required
def get_students():
    class_filter = request.args.get("class")
    query = {}
    if class_filter:
        query["class"] = class_filter
    
    students = list(students_collection.find(query))
    return jsonify({
        "success": True,
        "message": "Students fetched successfully",
        "data": {"students": [student_to_dict(s) for s in students]}
    }), 200

@students_bp.route("/<id>", methods=["GET"])
@token_required
def get_student(id):
    student = find_student_by_id(id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404
    
    return jsonify({
        "success": True,
        "message": "Student fetched successfully",
        "data": {"student": student_to_dict(student)}
    }), 200

@students_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
@roles_required(["teacher"])
def add_student():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    required = ["name", "email", "class"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"{field} is required"}), 400
            
    student = create_student(data)
    return jsonify({
        "success": True,
        "message": "Student created successfully",
        "data": {"student": student_to_dict(student)}
    }), 201

@students_bp.route("/<id>", methods=["PUT"])
@token_required
@roles_required(["teacher"])
def update_student(id):
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
        
    update_student_by_id(id, data)
    updated_student = find_student_by_id(id)
    
    return jsonify({
        "success": True,
        "message": "Student updated successfully",
        "data": {"student": student_to_dict(updated_student)}
    }), 200

@students_bp.route("/<id>", methods=["DELETE"])
@token_required
@roles_required(["teacher"])
def delete_student(id):
    result = delete_student_by_id(id)
    if result.deleted_count == 0:
        return jsonify({"success": False, "message": "Student not found"}), 404
        
    return jsonify({
        "success": True,
        "message": "Student deleted successfully",
        "data": {}
    }), 200