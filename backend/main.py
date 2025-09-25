from teacher import Teacher


def main():
    T1 = Teacher(1, "John Doe", "john.doe@example.com", ["Math", "Science"])
    T1.add_teacher_schedule(0, 0, "Math")
    T1.add_teacher_schedule(0, 1, "Science")
    print(T1.info_getter())


if __name__ == "__main__":
    main()
