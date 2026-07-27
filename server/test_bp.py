from flask import Flask, Blueprint
app = Flask(__name__)
bp = Blueprint('bp', __name__)
@bp.route("", strict_slashes=False)
@bp.route("/", strict_slashes=False)
def index(): return "ok"
app.register_blueprint(bp, url_prefix='/api/notes')
print(app.url_map)
