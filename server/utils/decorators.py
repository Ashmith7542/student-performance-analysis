import jwt
from functools import wraps
from flask import request, jsonify
from config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "message": "Invalid token format"}), 401
        
        token = parts[1]
        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            request.user_id = data["user_id"]
            request.user_role = data.get("role")
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated

