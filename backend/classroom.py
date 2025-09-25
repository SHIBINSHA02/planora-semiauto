class Classroom:
    def __init__(self, classroom_id, name, subject_details, classroomSchedule):
        self.classroom_id = classroom_id
        self.name = name
        self.subject_details = subject_details
        self.classroomSchedule = classroomSchedule
        self.remaining_periods = subject_details.copy()

    def info_getter(self):
        return {
            "classroom_id": self.classroom_id,
            "name": self.name,
            "subject_details": self.subject_details,
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

    def decrement_period_count(self, subject_name, periods=1):
        """Decrements the remaining period count for a subject."""
        # Only decrement if the subject exists and the count is sufficient
        if self.remaining_periods.get(subject_name, 0) >= periods:
            self.remaining_periods[subject_name] -= periods
            return True
        return False
