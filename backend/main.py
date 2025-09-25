import json
import random
from teacher import Teacher
from classroom import Classroom
from subject import Subject


def load_data(filename):
    """Loads a JSON file."""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {filename} not found. Check path.")
        return {}


def init_teachers(teacher_data):
    """Initializes Teacher objects from the loaded data."""
    teachers_map = {}
    for data in teacher_data.values():
        teacher_Obx = Teacher(
            teacher_id=data['teacher_id'],
            name=data['name'],
            mail=f"{data['teacher_id']}@gmail.com",
            subjects=data['subject'],
        )

        teachers_map[data['teacher_id']] = teacher_Obx

    return teachers_map


def init_classroom(classroom_data):
    """Initializes Classroom objects from the loaded data."""

    classroom_map = {}

    for data in classroom_data.values():
        classroom_Obx = Classroom(
            classroom_id=data['classroom_id'],
            name=data['classroom'],
            subject_details=data['subject_details'],
            classroomSchedule=data['allocation']
        )

        classroom_map[data['classroom_id']] = classroom_Obx

    return classroom_map


def allocate_classroom():
    return None


def main():
    teacher_raw_data = load_data('backend/teacher.json')
    classroom_raw_data = load_data('backend/sample.json')

    teachers_map = init_teachers(teacher_raw_data)
    classroom_map = init_classroom(classroom_raw_data)

    # for teacher_obj in teachers_map.values():
    #     print(teacher_obj.info_getter())

    # for classroom_obj in classroom_map.values():
    #     print(classroom_obj.info_getter())


if __name__ == "__main__":
    main()
