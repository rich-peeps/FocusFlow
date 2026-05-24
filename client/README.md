# FocusFlow

FocusFlow is a full-stack productivity app that helps bootcamp students and self-taught developers organize their work into projects and tasks, then focus on what matters today. Users can create projects, break them down into tasks, assign status and priority, and flag tasks for a “Today” view across all projects.

---

## Features

- **User authentication**
  - Sign up and log in with secure password hashing.
  - Auth state persisted via JWT stored in `localStorage`.

- **Projects**
  - Create, view, and delete projects.
  - Each project belongs to the logged-in user.
  - Click a project to see its tasks.

- **Tasks**
  - Create tasks within a project.
  - Fields: title, description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), and `today_focus` flag.
  - Update status and Today flag for existing tasks.
  - Filter tasks by status and priority.
  - Delete tasks.

- **Today View**
  - `/today` shows all tasks across projects that are flagged as `today_focus`.
  - Mark tasks done/undone and remove them from Today.

- **Protected routes**
  - `/projects`, `/projects/:id`, and `/today` are only accessible when logged in.

---

## Tech Stack

**Backend**

- Python, Flask
- Flask-JWT-Extended (JWT auth)
- Flask-Bcrypt (password hashing)
- Flask-SQLAlchemy, Marshmallow-style serialization via `to_dict`
- PostgreSQL (or SQLite in local dev)

**Frontend**

- React (Vite)
- React Router
- Custom hooks/context for auth
- Plain CSS + small reusable components (PageLayout, TextInput, AuthFormLayout)

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js and npm
- PostgreSQL running locally (or adjust to SQLite for dev)

### 1. Clone the repo

```bash
git clone https://github.com/rich-peeps/FocusFlow.git
cd FocusFlow 
```

### 2. Backend Setup (Flask)

From the server directory:
```bash
cd server
pipenv install
```

Configure the database URI in app.py:
```python
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://localhost/focusflow_dev"
```

Create the database (Postgres example):
```bash
createdb focusflow_dev
```

Run migrations:
```bash
pipenv run flask db init
pipenv run flask db migrate -m "Initial tables"
pipenv run flask db upgrade
```

Start the backend server:
```bash
pipenv run python app.py
```

The API will be available at http://localhost:5555.

---

## Projects

_All routes require_ `Authorization: Bearer <token>`.

- **GET `/api/projects`**  
  List current user’s projects.

- **POST `/api/projects`**  
  Body:

  ```json
  {
    "title": "Project title",
    "description": "Optional description"
  }
  ```

- **GET `/api/projects/<id>`**
Get a single project for the current user.

- **POST `/api/projects/<id>`**
Body can include { "title", "description" } to update.

- **DELETE `/api/projects/<id>`**
Delete the project and its tasks.

## Tasks

_All routes require_ `Authorization: Bearer <token>`.

- **GET `/api/projects/<project_id>/tasks`**
List tasks for a given project.

- **POST `/api/projects/<project_id>/tasks`**
{
  "title": "Task title",
  "description": "Optional",
  "status": "todo",        // optional
  "priority": "medium",    // optional
  "today_focus": false     // optional
}

- **GET `/api/tasks/<task_id>`**
Get a single task (scoped to current user).

- **PATCH `/api/tasks/<task_id>`**
Body can include any of:
{ "title", "description", "status", "priority", "today_focus" }.

- **DELETE `/api/tasks/<task_id>`**
Delete the task.

## Today

- **GET `/api/today`**
Returns all tasks where today_focus == true for the current user.

## Frontend Routes

/login – Login form
/signup – Signup form
/projects – List and create projects
/projects/:id – Project detail with tasks
/today – Today’s focus tasks
Protected routes redirect to /login when not authenticated.


## Login page

Projects list
Project detail with tasks
Today view