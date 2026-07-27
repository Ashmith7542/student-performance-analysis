from functools import wraps
from flask import request, jsonify
import jwt
from config import Config
from bson.objectid import ObjectId

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"success": False, "message": "Authentication token is missing"}), 401

        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            # Add user context to the request if needed
            request.user_id = data["user_id"]
            request.user_role = data["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired"}), 401
        except Exception:
            return jsonify({"success": False, "message": "Token is invalid"}), 401

        return f(*args, **kwargs)

    return decorated

def roles_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, "user_role") or request.user_role not in roles:
                return jsonify({"success": False, "message": "Permission denied"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
