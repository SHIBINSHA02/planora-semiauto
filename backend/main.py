from teacher import Teacher
from classroom import Classroom
from subject import Subject


def main():
    T1 = Teacher(1, "John Doe", "john.doe@example.com", ["Math", "Science"])
    C1 = Classroom(1, "CSE S7 R1", ["Math", "Science"])
    S1 = Subject(1, "Math", False, 2)
    S2 = Subject(2, "Science", False, 2)
    T1.add_teacher_schedule(0, 0, C1, S1)
    T1.add_teacher_schedule(0, 1, C1, S2)
    print(T1.info_getter())
    print(C1.info_getter())
    print(S1.info_getter())


if __name__ == "__main__":
    main()
