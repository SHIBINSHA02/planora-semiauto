from . import db
from sqlalchemy.dialects.postgresql import JSON 
# Teacher Table
class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teachername = db.Column(db.String(100), nullable=False)
    mailid = db.Column(db.String(120), unique=True, nullable=False)
    subjects = db.relationship("Subject", backref="teacher", lazy=True)
# Subject Table
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teacher.id"), nullable=False)
# Classroom Table
class Classroom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    classroom_id = db.Column(db.Integer, unique=True, nullable=False)
    classroom = db.Column(db.String(100), nullable=False)
    admin_email = db.Column(db.String(120), nullable=False)
    subject_details = db.Column(JSON, nullable=True)  # {"Math": 5, "Physics": 3, ...}
    allocation = db.Column(
        JSON,
        nullable=False,
        default=lambda: [[None for _ in range(6)] for _ in range(5)]
    )      # full 5x6 grid default

    def to_dict(self):
        return {
            "classroom_id": self.classroom_id,
            "classroom": self.classroom,
            "subject_details": self.subject_details,
            "admin_email": self.admin_email,
            "allocation": self.allocation,
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
