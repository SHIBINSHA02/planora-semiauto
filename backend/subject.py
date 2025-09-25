class Subject:
    def __init__(self, subject_id, name, is_lab, periods_per_session):
        self.subject_id = subject_id
        self.name = name
        self.is_lab = is_lab
        self.periods_per_session = periods_per_session

    def is_lab_subject(self):
        """Returns True if the subject requires consecutive lab periods."""
        return self.is_lab
