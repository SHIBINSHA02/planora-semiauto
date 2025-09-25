from flask import Blueprint, request, jsonify
from .models import db, Teacher, Classroom,Subject
timetable_bp = Blueprint("timetable", __name__)



#---------------:end points:-------------
#GET /timetable/teachers
#POST /timetable/add_teacher    
#POST /timetable/add_schedule
#GET /timetable/classroom/<classname>
#-----------------------------------------






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
# Input JSON format (can contain multiple classrooms):
# {
#   "1": {
#       "classroom_id": 1,
#       "classroom": "CSE S7 R1",
#       "subject_details": {
#           "Mathematics": 5,
#           "Physics": 3,
#           "Assembly": 3
#       },
#       "admin_email": "shibinikka@gmail.com",
#       "allocation": [
#           [
#               [{"subject": "Mathematics", "teacher_id": "T001"}, {"subject": "Physics", "teacher_id": "T002"}],
#               null,
#               ...
#           ],
#           ...
#       ]
#   },
#   "2": { ... }
# }
# Notes:
# - "subject_details" maps each subject to the number of weekly slots
# - "allocation" is a 5x6 list representing 5 days and 6 periods per day
# - If classroom_id exists, the record will be updated; otherwise, a new classroom is created
# Response JSON:
# {
#   "message": "Classrooms added/updated successfully",
#   "ids": [1, 2]  # list of classroom_ids added or updated
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
# GET /timetable/classroom/<classname>
# URL Parameter:
# - classname: string, the name of the classroom to fetch
# Example URL:
# http://127.0.0.1:5000/timetable/classroom/CSE%20S7%20R1
# Response JSON when classroom exists:
# {
#   "classroom_id": 1,
#   "classroom": "CSE S7 R1",
#   "admin_email": "shibinikka@gmail.com",
#   "subject_details": {
#       "Mathematics": 5,
#       "Physics": 3,
#       "Assembly": 3,
#       "History": 4,
#       "Art": 5,
#       "Computer Science": 5,
#       "English": 5
#   },
#   "allocation": [
#       [
#           [{"subject": "Mathematics", "teacher_id": "T001"}, ...],
#           ...
#       ],
#       ...
#   ]
# }
# If classroom not found:
# {
#   "error": "Classroom not found"
# }
# Notes:
# - Fetches a classroom by its name
# - Returns full schedule (allocation) and subject details
# ------------------------------------
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
