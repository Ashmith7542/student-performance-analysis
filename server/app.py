from flask import Flask, jsonify
from flask_cors import CORS
from database import db
from config import Config
from routes.auth import auth_bp
from routes.students import students_bp
from routes.predict import predict_bp
from routes.attendance import attendance_bp
from routes.notes import notes_bp
from routes.permissions import permissions_bp
from routes.timetable import timetable_bp
from routes.admin import admin_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(students_bp, url_prefix="/api/students")
app.register_blueprint(predict_bp, url_prefix="/api/predict")
app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
app.register_blueprint(notes_bp, url_prefix="/api/notes")
app.register_blueprint(permissions_bp, url_prefix="/api/permissions")
app.register_blueprint(timetable_bp, url_prefix="/api/timetable")
app.register_blueprint(admin_bp, url_prefix="/api/admin")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"success": True, "message": "Server is running", "data": {"status": "ok", "database": "connected"}})

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"success": False, "message": str(e)}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == "__main__":
    from utils.admin_init import init_admin
    init_admin()
    print(app.url_map)
    app.run(host="0.0.0.0", port=Config.PORT, debug=True, use_reloader=False)

