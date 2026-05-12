from sqlalchemy.ext.hybrid import hybrid_property
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hashes may not be viewed.")

    @password_hash.setter
    def password_hash(self, password):
        pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        self._password_hash = pw_hash

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password)

    def to_dict(self):
        # Basic serializer without exposing password
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }
