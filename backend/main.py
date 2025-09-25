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
    for teacher_key, data in teacher_data.items():
        teacher_Obx = Teacher(
            teacher_id=data['teacher_id'],
            name=data['name'],
            mail=f"{data['teacher_id']}@gmail.com",
            subjects=data['subject'],
        )

        teachers_map[data['teacher_id']] = teacher_Obx

    return teachers_map


def main():
    teacher_raw_data = load_data('backend/teacher.json')

    teachers_map = init_teachers(teacher_raw_data)

    for teacher_obj in teachers_map.values():
        print(teacher_obj.info_getter())


if __name__ == "__main__":
    main()
