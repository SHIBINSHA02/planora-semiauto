from flask import Blueprint, request, jsonify
from .models import db, Teacher, Subject, Classroom, Schedule

timetable_bp = Blueprint("timetable", __name__)

# 1. Add Teacher
# -----------------------------
# 1. Add Teacher
# -----------------------------
# POST /timetable/add_teacher
# Input JSON format (one teacher per request):
# {
#   "teachername": "Alice",
#   "mailid": "alice@example.com",
#   "subjects": ["Math", "Physics"]
# }
# Response JSON:
# {
#   "message": "Teacher added successfully"
# }
@timetable_bp.route("/add_teacher", methods=["POST"])
def add_teacher():
    data = request.json
    teacher = Teacher(teachername=data["teachername"], mailid=data["mailid"])
    db.session.add(teacher)
    db.session.commit()

    for subj in data["subjects"]:
        subject = Subject(name=subj, teacher_id=teacher.id)
        db.session.add(subject)

    db.session.commit()
    return jsonify({"message": "Teacher added successfully"}), 201

# 2. Add Schedule
# -----------------------------
# 2. Add Schedule
# -----------------------------
# POST /timetable/add_schedule
# Input JSON format:
# {
#   "admin": "alice@example.com",        # email of teacher who can edit this class
#   "classname": "ClassA",               # name of the class
#   "schedule": [
#       {"subject": "Math", "teachername": "Alice", "time": 5},
#       {"subject": "English", "teachername": "Bob", "time": 3},
#       {"subject": "Physics", "teachername": "Alice", "time": 2}
#   ]
# }
# Notes:
# - "time" represents number of weekly slots for that subject
# - "teachername" must match an existing teacher
# Response JSON:
# {
#   "message": "Schedule added successfully"
# }
# ------------------------------------
@timetable_bp.route("/add_schedule", methods=["POST"])
def add_schedule():
    data = request.json

    classroom = Classroom.query.filter_by(name=data["classname"]).first()
    if not classroom:
        classroom = Classroom(name=data["classname"], admin_mail=data["admin"])
        db.session.add(classroom)
        db.session.commit()

    for entry in data["schedule"]:
        sched = Schedule(
            subject=entry["subject"],
            teachername=entry["teachername"],
            slots_per_week=entry["time"],  # time means slots/week
            classroom_id=classroom.id
        )
        db.session.add(sched)

    db.session.commit()
    return jsonify({"message": "Schedule added successfully"}), 201
