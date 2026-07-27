from flask import Blueprint, request, jsonify
from models import create_prediction, fetch_predictions, prediction_to_dict
from utils.auth_middleware import token_required

predict_bp = Blueprint("predict", __name__)

def calculate_grade(score):
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B"
    if score >= 60: return "C"
    if score >= 50: return "D"
    return "F"

@predict_bp.route("", strict_slashes=False, methods=["POST"])
@token_required
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    attendance = data.get("attendance", 0)
    study_hours = data.get("studyHours", 0)
    prev_scores = data.get("previousScores", [])
    age = data.get("age", 18)
    student_id = data.get("studentId")

    # Simple heuristic prediction logic
    avg_prev = sum(prev_scores) / len(prev_scores) if prev_scores else 50
    
    # Contributions (simplified)
    # attendance (0-100) -> max 30 points
    # study hours (0-20) -> max 20 points
    # prev scores (0-100) -> max 40 points
    # age (base) -> 10 points
    att_contrib = (attendance / 100) * 30
    study_contrib = min((study_hours / 10) * 20, 20)
    prev_contrib = (avg_prev / 100) * 40
    age_contrib = 10 if age > 15 else 5
    
    total_score = att_contrib + study_contrib + prev_contrib + age_contrib
    total_score = min(total_score, 100)
    
    prediction_result = {
        "score": round(total_score, 2),
        "grade": calculate_grade(total_score),
        "breakdown": {
            "attendance_contribution": round(att_contrib, 2),
            "study_hours_contribution": round(study_contrib, 2),
            "previous_scores_contribution": round(prev_contrib, 2),
            "age_contribution": round(age_contrib, 2)
        }
    }
    
    if student_id:
        create_prediction({
            "student_id": student_id,
            "prediction": prediction_result,
            "user_id": request.user_id # Who performed the prediction
        })
        
    return jsonify({
        "success": True,
        "message": "Prediction generated successfully",
        "data": prediction_result
    }), 200

@predict_bp.route("/history", methods=["GET"])
@token_required
def get_prediction_history():
    # If the user is a student, they might only want their own history
    # For now, let's just fetch all or filter by role logic if needed
    # But usually, it's filtered by studentId in the query or similar
    
    student_id = request.args.get("studentId")
    history = fetch_predictions(student_id)
    
    return jsonify({
        "success": True,
        "message": "Prediction history fetched successfully",
        "data": {"predictions": [prediction_to_dict(p) for p in history]}
    }), 200
