from flask import Blueprint, request, jsonify
from models import notes_collection, note_to_dict
from utils.auth_middleware import token_required, roles_required
from datetime import datetime

notes_bp = Blueprint("notes", __name__)

@notes_bp.route("", strict_slashes=False, methods=["GET"])
@token_required
def get_notes():
    subject = request.args.get("subject")
    
    # Base query
    query = {}
    if subject:
        query["subject"] = subject
        
    # Access Control: If student, filter by department
    if request.user_role == "student":
        # Import models here to avoid circular imports if any, 
        # though models.py is already imported at top
        from models import users_collection
        user = users_collection.find_one({"email": request.args.get("email")}) # Fallback logic
        # Better: get user by ID from token
        from bson import ObjectId
        user_record = users_collection.find_one({"_id": ObjectId(request.user_id)})
        
        if user_record and user_record.get("department"):
            query["department"] = user_record.get("department")
        else:
            # If student's dept is not set, they see nothing from filtered categories
            # or we can decide they see "General" notes.
            # But the requirement is "only that particular students should see... uploaded by their respective teacher"
            pass

    records = list(notes_collection.find(query).sort("created_at", -1))
    return jsonify({
        "success": True,
        "message": "Notes fetched successfully",
        "data": {"notes": [note_to_dict(r) for r in records]}
    }), 200

@notes_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
@roles_required(["teacher"])
def upload_note():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    data["created_at"] = datetime.utcnow().isoformat()
    data["uploaded_by"] = request.user_id # From token_required middleware
    
    # Ensure department is attached to the note
    if "department" not in data:
        from models import users_collection
        from bson import ObjectId
        teacher = users_collection.find_one({"_id": ObjectId(request.user_id)})
        if teacher:
            data["department"] = teacher.get("department")
    
    result = notes_collection.insert_one(data)
    data["_id"] = result.inserted_id
    
    return jsonify({
        "success": True,
        "message": "Note uploaded successfully",
        "data": {"note": note_to_dict(data)}
    }), 201
