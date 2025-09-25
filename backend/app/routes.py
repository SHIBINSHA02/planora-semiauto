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

# -----------------------------
# Additional Endpoints for UI integration
# -----------------------------

# List all classrooms (basic info)
@timetable_bp.route("/classrooms", methods=["GET"])
def list_classrooms():
    classrooms = Classroom.query.all()
    return jsonify({
        "classrooms": [
            {
                "id": c.id,
                "classroom_id": c.classroom_id,
                "classroom": c.classroom,
                "admin_email": c.admin_email,
            } for c in classrooms
        ]
    })

# Get classroom by numeric classroom_id
@timetable_bp.route("/classrooms/<int:classroom_id>", methods=["GET"])
def get_classroom_by_id(classroom_id: int):
    classroom = Classroom.query.filter_by(classroom_id=classroom_id).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404
    return jsonify(classroom.to_dict())

# Get subjects for a classroom (derived from subject_details keys)
@timetable_bp.route("/classrooms/<int:classroom_id>/subjects", methods=["GET"])
def get_subjects_for_classroom(classroom_id: int):
    classroom = Classroom.query.filter_by(classroom_id=classroom_id).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404
    subject_details = classroom.subject_details or {}
    return jsonify({"subjects": list(subject_details.keys())})

# Update a single time slot allocation (supports multiple teachers per slot)
# Payload: {"dayIndex": 0-4, "periodIndex": 0-5, "assignments": [{"teacher_id": int, "subject": str}, ...]}
@timetable_bp.route("/classrooms/<int:classroom_id>/slot", methods=["PATCH"])
def update_classroom_slot(classroom_id: int):
    data = request.json or {}
    day_index = data.get("dayIndex")
    period_index = data.get("periodIndex")
    assignments = data.get("assignments")

    if day_index is None or period_index is None or assignments is None:
        return jsonify({"error": "dayIndex, periodIndex and assignments are required"}), 400

    classroom = Classroom.query.filter_by(classroom_id=classroom_id).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404

    allocation = classroom.allocation or []
    # Ensure 5x6 grid
    while len(allocation) < 5:
        allocation.append([None] * 6)
    for i in range(5):
        row = allocation[i]
        while len(row) < 6:
            row.append(None)
        allocation[i] = row

    # Normalize assignments (store as list of {subject, teacher_id}) or None
    normalized = []
    for a in assignments:
        if not a:
            continue
        subject = a.get("subject")
        teacher_id = a.get("teacher_id")
        if subject is None or teacher_id is None:
            continue
        normalized.append({"subject": subject, "teacher_id": int(teacher_id)})

    allocation[day_index][period_index] = normalized if normalized else None
    classroom.allocation = allocation
    db.session.commit()

    return jsonify({"message": "Slot updated", "allocation": classroom.allocation})


def _build_teacher_subjects_map():
    teachers = Teacher.query.all()
    teacher_id_to_subjects = {}
    for t in teachers:
        teacher_id_to_subjects[t.id] = [s.name for s in t.subjects]
    return teacher_id_to_subjects

def _is_teacher_assigned_elsewhere(teacher_id: int, day_index: int, period_index: int, exclude_classroom_id: int | None = None):
    classrooms = Classroom.query.all()
    for c in classrooms:
        if exclude_classroom_id is not None and c.classroom_id == exclude_classroom_id:
            continue
        if not c.allocation:
            continue
        try:
            cell = c.allocation[day_index][period_index]
        except Exception:
            cell = None
        if not cell:
            continue
        for assign in cell:
            if assign and int(assign.get("teacher_id")) == int(teacher_id):
                return True
    return False

# Check if a teacher is available for a given slot and subject
@timetable_bp.route("/teachers/<int:teacher_id>/availability", methods=["GET"])
def is_teacher_available_endpoint(teacher_id: int):
    day = int(request.args.get("day", -1))
    period = int(request.args.get("period", -1))
    subject = request.args.get("subject")
    classroom_id = request.args.get("classroom_id")
    if day < 0 or period < 0:
        return jsonify({"error": "day and period are required"}), 400
    # Validate subject capability if provided
    teacher = Teacher.query.get(teacher_id)
    if not teacher:
        return jsonify({"error": "Teacher not found"}), 404
    if subject is not None:
        if subject not in [s.name for s in teacher.subjects]:
            return jsonify({"available": False, "reason": "Subject not taught by teacher"})

    exclude = int(classroom_id) if classroom_id is not None else None
    busy = _is_teacher_assigned_elsewhere(teacher_id, day, period, exclude_classroom_id=exclude)
    return jsonify({"available": not busy})


# Get available teachers for a slot in a classroom, optionally filtered by subject
@timetable_bp.route("/teachers/available", methods=["GET"])
def get_available_teachers_for_slot():
    classroom_id = request.args.get("classroom_id")
    day = request.args.get("day")
    period = request.args.get("period")
    subject = request.args.get("subject")

    if classroom_id is None or day is None or period is None:
        return jsonify({"error": "classroom_id, day, period are required"}), 400

    day_index = int(day)
    period_index = int(period)

    teacher_subjects = _build_teacher_subjects_map()
    result = []
    for teacher_id, subjects in teacher_subjects.items():
        if subject is not None and subject not in subjects:
            continue
        if _is_teacher_assigned_elsewhere(teacher_id, day_index, period_index, exclude_classroom_id=int(classroom_id)):
            continue
        t = Teacher.query.get(teacher_id)
        result.append({
            "id": t.id,
            "teachername": t.teachername,
            "mailid": t.mailid,
            "subjects": subjects
        })

    return jsonify({"teachers": result})


# Auto-generate simple schedule stub: clears empty cells by proposing subject-only placeholders
@timetable_bp.route("/classrooms/<int:classroom_id>/auto_generate", methods=["POST"])
def auto_generate_schedule(classroom_id: int):
    classroom = Classroom.query.filter_by(classroom_id=classroom_id).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404

    allocation = classroom.allocation or []
    while len(allocation) < 5:
        allocation.append([None] * 6)
    for i in range(5):
        row = allocation[i]
        while len(row) < 6:
            row.append(None)
        allocation[i] = row

    subjects = list((classroom.subject_details or {}).keys())
    # naive fill: keep None cells untouched; this is a stub for UI integration
    classroom.allocation = allocation
    db.session.commit()
    return jsonify({"message": "Auto-generate completed", "allocation": classroom.allocation})
