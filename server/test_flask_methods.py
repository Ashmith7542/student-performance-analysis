from flask import Flask, Blueprint, request
app = Flask(__name__)
bp = Blueprint('bp', __name__)

@bp.route("", strict_slashes=False, methods=["GET"])
@bp.route("/", strict_slashes=False, methods=["GET"])
def get_notes(): return "GET"

@bp.route("", strict_slashes=False, methods=["POST"])
@bp.route("/", strict_slashes=False, methods=["POST"])
def upload_note(): return "POST"

app.register_blueprint(bp, url_prefix='/api/notes')
print(app.url_map)

with app.test_client() as c:
    print("GET /api/notes:", c.get('/api/notes').data)
    print("POST /api/notes:", c.post('/api/notes').status_code)
