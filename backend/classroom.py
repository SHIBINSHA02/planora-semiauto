class Classroom:
    def __init__(self, classroom_id, name, subjects):
        self.classroom_id = classroom_id
        self.name = name
        self.subjects = subjects
        self.classroomSchedule = []

    def info_getter(self):
        return {
            "classroom_id": self.classroom_id,
            "name": self.name,
            "subjects": self.subjects,
            "classroomSchedule": self.classroomSchedule
        }

    def add_classroom_schedule(self, day, time, subject):
        self.classroomSchedule.append({
            "day": day,
            "time": time,
            "subject": subject
        })
