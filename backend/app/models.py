from . import db

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
    name = db.Column(db.String(100), unique=True, nullable=False)
    admin_mail = db.Column(db.String(120), nullable=False)  # teacher email as admin
    schedules = db.relationship("Schedule", backref="classroom", lazy=True)

# Schedule Table
class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    teachername = db.Column(db.String(100), nullable=False)
    slots_per_week = db.Column(db.Integer, nullable=False)  # new rule
    classroom_id = db.Column(db.Integer, db.ForeignKey("classroom.id"), nullable=False)
