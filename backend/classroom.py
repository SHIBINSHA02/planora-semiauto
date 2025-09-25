class Classroom:
    def __init__(self, classroom_id, name, subjects):
        self.classroom_id = classroom_id
        self.name = name
        self.subjects = subjects
        self.classroomSchedule = [[None for _ in range(6)] for _ in range(5)]

    def info_getter(self):
        return {
            "classroom_id": self.classroom_id,
            "name": self.name,
            "subjects": self.subjects,
            "classroomSchedule": self.classroomSchedule
        }

    def classroom_is_free(self, day, period):
        """Returns True if the classroom is free at the given day and period."""
        return self.classroomSchedule[day][period] is None

    def add_classroom_schedule(self, day, period, subject, teacher):
        """Adds the classroom schedule for the given day and period."""
        period_details = {
            "subject": subject,
            "teacher": teacher,
        }
        self.classroomSchedule[day][period] = period_details
