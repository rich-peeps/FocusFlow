from flask import Flask, request
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

from models import db, bcrypt, User

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://localhost/focusflow_dev"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-me"  # move to env later
app.json.compact = False

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)


@app.get("/health")
def health():
    return {"status": "ok"}, 200


@app.post("/api/signup")
def signup():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return {"error": "username, email, and password are required"}, 400

    try:
        user = User(username=username, email=email)
        user.password_hash = password  # uses the setter to hash
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"error": "Username or email already taken"}, 422

    access_token = create_access_token(identity=str(user.id))
    return {"user": user.to_dict(), "access_token": access_token}, 201


@app.post("/api/login")
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "username and password are required"}, 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.authenticate(password):
        return {"error": "Invalid username or password"}, 401

    access_token = create_access_token(identity=str(user.id))
    return {"user": user.to_dict(), "access_token": access_token}, 200


@app.get("/api/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return {"error": "Invalid token identity"}, 422

    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404
    return user.to_dict(), 200


if __name__ == "__main__":
    app.run(port=5555, debug=True)