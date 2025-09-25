from flask import Blueprint, request, jsonify
from .models import db, Teacher, Subject, Classroom, Schedule

timetable_bp = Blueprint("timetable", __name__)

# 1. Add Teacher
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

# 3. Get Schedule
@timetable_bp.route("/get_schedule/<classname>", methods=["GET"])
def get_schedule(classname):
    classroom = Classroom.query.filter_by(name=classname).first()
    if not classroom:
        return jsonify({"error": "Classroom not found"}), 404

    schedule = [
        {"subject": s.subject, "teachername": s.teachername, "slots_per_week": s.slots_per_week}
        for s in classroom.schedules
    ]
    return jsonify({
        "classname": classname,
        "admin": classroom.admin_mail,
        "schedule": schedule
    })
