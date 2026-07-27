from flask import Flask, request

app = Flask(__name__)

@app.route("/", methods=["POST"])
def index():
    request.user_id = "123"
    return f"User ID: {request.user_id}"

with app.test_client() as c:
    print(c.post('/').data)
