from flask import Flask, request
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from models import db, bcrypt, User, Project, Task

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

def get_current_user_id():
    user_id = get_jwt_identity()
    try:
        return int(user_id)
    except (TypeError, ValueError):
        return None


@app.get("/api/projects")
@jwt_required()
def list_projects():
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    projects = Project.query.filter_by(user_id=user_id).all()
    return [p.to_dict() for p in projects], 200

@app.post("/api/projects")
@jwt_required()
def create_project():
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")

    if not title:
        return {"error": "title is required"}, 400

    project = Project(name=title, description=description, user_id=user_id)
    db.session.add(project)
    db.session.commit()
    return project.to_dict(), 201

@app.get("/api/projects/<int:project_id>")
@jwt_required()
def get_project(project_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return {"error": "Project not found"}, 404

    return project.to_dict(), 200

@app.patch("/api/projects/<int:project_id>")
@jwt_required()
def update_project(project_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return {"error": "Project not found"}, 404

    data = request.get_json() or {}
    if "title" in data and data["title"]:
        project.name = data["title"]
    if "description" in data:
        project.description = data["description"]

    db.session.commit()
    return project.to_dict(), 200

@app.delete("/api/projects/<int:project_id>")
@jwt_required()
def delete_project(project_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return {"error": "Project not found"}, 404

    db.session.delete(project)
    db.session.commit()
    return {}, 204

@app.get("/api/projects/<int:project_id>/tasks")
@jwt_required()
def list_tasks(project_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    tasks = Task.query.filter_by(project_id=project_id, user_id=user_id).all()
    return [t.to_dict() for t in tasks], 200


@app.post("/api/projects/<int:project_id>/tasks")
@jwt_required()
def create_task(project_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    status = data.get("status", "todo")
    priority = data.get("priority", "medium")
    today_focus = bool(data.get("today_focus", False))

    if not title:
        return {"error": "title is required"}, 400

    task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        today_focus=today_focus,
        project_id=project_id,
        user_id=user_id,
    )
    db.session.add(task)
    db.session.commit()
    return task.to_dict(), 201


@app.get("/api/tasks/<int:task_id>")
@jwt_required()
def get_task(task_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return {"error": "Task not found"}, 404

    return task.to_dict(), 200


@app.patch("/api/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return {"error": "Task not found"}, 404

    data = request.get_json() or {}
    if "title" in data and data["title"]:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "status" in data:
        task.status = data["status"]
    if "priority" in data:
        task.priority = data["priority"]
    if "today_focus" in data:
        task.today_focus = bool(data["today_focus"])

    db.session.commit()
    return task.to_dict(), 200


@app.delete("/api/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = get_current_user_id()
    if not user_id:
        return {"error": "Invalid token identity"}, 422

    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return {"error": "Task not found"}, 404

    db.session.delete(task)
    db.session.commit()
    return {}, 204


if __name__ == "__main__":
    app.run(port=5555, debug=True)