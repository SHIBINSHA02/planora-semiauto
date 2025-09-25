class Teacher:
    def __init__(self, teacher_id, name, mail, subjects):
        self.teacher_id = teacher_id
        self.name = name
        self.mail = mail
        self.subjects = subjects
        self.teacherSchedule = [[None for _ in range(6)] for _ in range(5)]

    def info_getter(self):
        return {
            "teacher_id": self.teacher_id,
            "name": self.name,
            "mail": self.mail,
            "subjects": self.subjects,
            "teacherSchedule": self.teacherSchedule
        }

    def add_teacher_schedule(self, day, time, subject):
        self.teacherSchedule[day][time] = subject
