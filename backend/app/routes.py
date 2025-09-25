from flask import Blueprint, request, jsonify
from .models import db, Teacher, Subject, Classroom, Schedule

timetable_bp = Blueprint("timetable", __name__)

# 0. Get Teachers List
# -----------------------------
# GET /timetable/teachers
# Response JSON:
# {
#   "teachers": [
#     {
#       "id": 1,
#       "teachername": "Alice",
#       "mailid": "alice@example.com",
#       "subjects": ["Math", "Physics"]
#     },
#     ...
#   ]
# }
@timetable_bp.route("/teachers", methods=["GET"])
def get_teachers():
    teachers = Teacher.query.all()
    result = []
    for teacher in teachers:
        subject_names = [subject.name for subject in teacher.subjects]
        result.append({
            "id": teacher.id,
            "teachername": teacher.teachername,
            "mailid": teacher.mailid,
            "subjects": subject_names
        })
    return jsonify({"teachers": result})

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

# 3. Get Classroom Schedule
# -----------------------------
# GET /timetable/classroom/<classname>/schedule
# Response JSON when classroom exists:
# {
#   "classname": "ClassA",
#   "admin": "alice@example.com",
#   "schedule": [
#     {"subject": "Math", "teachername": "Alice", "slots_per_week": 5},
#     ...
#   ]
# }
# If classroom not found:
# {"error": "Classroom not found"}
@timetable_bp.route("/classroom/<string:classname>/schedule", methods=["GET"])
def get_classroom_schedule(classname):
    classroom = Classroom.query.filter_by(name=classname).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404

    schedule_items = [{
        "subject": sched.subject,
        "teachername": sched.teachername,
        "slots_per_week": sched.slots_per_week
    } for sched in classroom.schedules]

    return jsonify({
        "classname": classroom.name,
        "admin": classroom.admin_mail,
        "schedule": schedule_items
    })
