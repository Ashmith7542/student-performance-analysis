from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime, timedelta, timezone
from config import Config
from models import find_user_by_email, create_user, verify_password, user_to_dict
from bson.objectid import ObjectId
from models import users_collection

auth_bp = Blueprint("auth", __name__)

def generate_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    # Log the incoming keys for debugging (masking password)
    print(f"Incoming registration request: {list(data.keys())}")

    required = ["email", "password", "name", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"{field} is required"}), 400

    if data["role"] not in ["student", "teacher"]:
        return jsonify({"success": False, "message": "Role must be student or teacher"}), 400

    if data["role"] == "admin":
        return jsonify({"success": False, "message": "Admin registration not allowed"}), 403

    # Consistency checks
    if find_user_by_email(data["email"]):
        return jsonify({"success": False, "message": "Email already registered"}), 409

    # Prepare data for insertion: remove confirmPassword if present
    user_payload = data.copy()
    user_payload.pop("confirmPassword", None)
    
    # Ensure rollNumber exists even if empty
    if "rollNumber" not in user_payload:
        user_payload["rollNumber"] = ""

    user = create_user(user_payload)
    token = generate_token(str(user["_id"]), user["role"])

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "data": {
            "token": token,
            "user": user_to_dict(user),
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"success": False, "message": "Email, password and role are required"}), 400

    user = find_user_by_email(email)
    if not user:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    if user.get("role") != role:
        return jsonify({"success": False, "message": "Invalid role for this account"}), 401

    if not verify_password(password, user["password"]):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    token = generate_token(str(user["_id"]), user["role"])

    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": {
            "token": token,
            "user": user_to_dict(user),
        }
    }), 200

@auth_bp.route("/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"success": False, "message": "Token is missing"}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"success": False, "message": "Invalid token format"}), 401

    token = parts[1]
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        user_id = decoded["user_id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Invalid token"}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({
        "success": True,
        "message": "User fetched successfully",
        "data": user_to_dict(user),
    }), 200

