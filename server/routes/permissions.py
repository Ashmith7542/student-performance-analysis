from flask import Blueprint, request, jsonify
from models import permissions_collection, permission_to_dict
from utils.auth_middleware import token_required, roles_required
from datetime import datetime
from bson import ObjectId

permissions_bp = Blueprint("permissions", __name__)

@permissions_bp.route("", strict_slashes=False, methods=["GET"])
@token_required
def get_permissions():
    if request.user_role == "student":
        query = {"student_id": request.user_id}
    else:
        query = {} # Teachers see all for now
        
    records = list(permissions_collection.find(query).sort("created_at", -1))
    return jsonify({
        "success": True,
        "message": "Permissions fetched successfully",
        "data": {"permissions": [permission_to_dict(r) for r in records]}
    }), 200

@permissions_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
@roles_required(["student"])
def request_permission():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    data["student_id"] = request.user_id
    data["status"] = "pending"
    data["created_at"] = datetime.utcnow().isoformat()
    
    result = permissions_collection.insert_one(data)
    data["_id"] = result.inserted_id
    
    return jsonify({
        "success": True,
        "message": "Permission requested successfully",
        "data": {"permission": permission_to_dict(data)}
    }), 201

@permissions_bp.route("/<id>/status", methods=["PUT"])
@token_required
@roles_required(["teacher"])
def update_permission_status(id):
    data = request.get_json()
    if not data or "status" not in data:
        return jsonify({"success": False, "message": "Status is required"}), 400
        
    permissions_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": data["status"]}}
    )
    
    return jsonify({
        "success": True,
        "message": f"Permission {data['status']}",
        "data": {}
    }), 200
