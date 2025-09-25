from flask import Blueprint, request, jsonify
from .models import db, Teacher, Classroom,Subject
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
    data = request.json  # Expecting JSON like {"1": {classroom_id, classroom, subject_details, admin_email, allocation}, ...}

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    created = []
    for key, value in data.items():
        # Look for existing classroom by classroom_id
        classroom = Classroom.query.filter_by(classroom_id=value["classroom_id"]).first()

        if classroom:
            # Update existing classroom
            classroom.classroom = value.get("classroom", classroom.classroom)
            classroom.admin_email = value.get("admin_email", classroom.admin_email)
            classroom.subject_details = value.get("subject_details", classroom.subject_details)
            classroom.allocation = value.get("allocation", classroom.allocation)
        else:
            # Create new classroom
            classroom = Classroom(
                classroom_id=value["classroom_id"],
                classroom=value["classroom"],
                admin_email=value["admin_email"],
                subject_details=value.get("subject_details"),
                allocation=value.get("allocation")
            )
            db.session.add(classroom)

        created.append(classroom.classroom_id)

    db.session.commit()
    return jsonify({"message": "Classrooms added/updated successfully", "ids": created}), 201

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
@timetable_bp.route("/classroom/<string:classname>", methods=["GET"])
def get_classroom_schedule(classname):
    # Fetch classroom by classroom_id
    classroom = Classroom.query.filter_by(classroom=classname).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404

    # Return classroom info including allocation and subject_details
    return jsonify({
        "classroom_id": classroom.classroom_id,
        "classroom": classroom.classroom,
        "admin_email": classroom.admin_email,
        "subject_details": classroom.subject_details,
        "allocation": classroom.allocation
    })
