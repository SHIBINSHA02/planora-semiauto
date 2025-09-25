# FILE: backend/main.py (Consolidated Code)

import json
import random
# Assuming Teacher, Classroom, and Subject classes are in the backend directory
from teacher import Teacher
from classroom import Classroom
from subject import Subject  # Assuming Subject class exists

# --- DATA LOADING & INIT ---


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
        teacher_obj = Teacher(
            teacher_id=data['teacher_id'],
            name=data['name'],
            mail=f"{data['teacher_id']}@gmail.com",
            subjects=data['subject'],
        )
        teachers_map[data['teacher_id']] = teacher_obj
    # NOTE: teachers_map keys are integers (1, 2, 3...)
    return teachers_map


def init_classroom(classroom_data):
    """Initializes Classroom objects from the loaded data."""
    classroom_map = {}
    for data in classroom_data.values():
        classroom_obj = Classroom(
            classroom_id=data['classroom_id'],
            name=data['classroom'],
            subject_details=data['subject_details'],
            # Start with an empty grid for the automated allocation
            classroomSchedule=[[None for _ in range(6)] for _ in range(5)]
        )
        # NOTE: classroom_map keys are integers (1, 2)
        classroom_map[data['classroom_id']] = classroom_obj
    return classroom_map


# --- CONSTRAINT & HELPER FUNCTIONS ---

def check_max_subject_periods(classroom_obj, day_index, subject):
    """
    HARD CONSTRAINT: Returns True if the subject is currently scheduled 
    less than 2 times on the given day.
    """
    count = 0
    # Iterate through all 6 periods of the specific day
    for assignment in classroom_obj.classroomSchedule[day_index]:
        if assignment is not None and assignment.get("subject") == subject:
            count += 1

    # The current assignment will be the next one, so we check if the count is strictly < 2
    return count < 2


def find_available_teacher(subject, teachers_map, day_index, period_index):
    """
    Returns a list of Teacher objects qualified for the subject AND free 
    at the specified day/period, sorted by ID (simple priority).
    """
    available_teachers = []

    for teacher_id, teacher_obj in teachers_map.items():
        if subject in teacher_obj.subjects:  # Check qualification
            # Check Teacher Availability (Hard Constraint: No Conflict)
            if teacher_obj.teacher_is_free(day_index, period_index):
                available_teachers.append(teacher_obj)

    # Prioritize the teacher with the lowest ID (simple weighting)
    available_teachers.sort(key=lambda t: t.teacher_id)
    return available_teachers


# --- ALLOCATION ENGINE ---

def allocate_single_period(classroom_obj, teachers_map):
    """
    Attempts to allocate ONE remaining period using a randomized greedy approach.
    Enforces cross-class and per-day subject constraints.
    """

    # 1. Identify Subject Demand (Pick the first subject with remaining demand)
    subject_to_schedule = next(
        (subject for subject, count in classroom_obj.remaining_periods.items() if count > 0),
        None  # Returns None if no subjects are left
    )

    if subject_to_schedule is None:
        return False

    # 2. Random Day/Period Selection
    days = [0, 1, 2, 3, 4]
    periods = [0, 1, 2, 3, 4, 5]
    random.shuffle(days)
    random.shuffle(periods)

    for day_index in days:
        # Check the new Max 2 Periods Per Day constraint BEFORE checking periods
        if not check_max_subject_periods(classroom_obj, day_index, subject_to_schedule):
            continue

        for period_index in periods:

            # Hard Constraint 1: Class Availability
            if not classroom_obj.classroom_is_free(day_index, period_index):
                continue

            # Hard Constraint 2: Teacher Availability (Checked within find_available_teacher)
            available_teachers = find_available_teacher(
                subject_to_schedule, teachers_map, day_index, period_index
            )

            if available_teachers:
                # Select the best available teacher (first one due to simple ID sort)
                teacher_obj = available_teachers[0]
                teacher_id = teacher_obj.teacher_id

                # --- 3. ALLOCATION: Parallel Update ---

                # A. Update Class Grid
                classroom_obj.add_classroom_schedule(
                    day_index, period_index, subject_to_schedule, teacher_id
                )

                # B. Update Teacher Grid (Crucial for cross-class conflict check)
                teacher_obj.add_teacher_schedule(
                    day_index, period_index, classroom_obj.name, subject_to_schedule
                )

                # C. Update Demand Counter
                classroom_obj.decrement_period_count(subject_to_schedule, 1)

                return True

    return False


def write_schedules_to_json(classroom_map, teachers_map):
    """Writes the final schedules for classrooms and teachers to a JSON file."""
    final_schedules = {
        "class_schedules": {cid: {"name": c.name, "final_allocation": c.classroomSchedule}
                            for cid, c in classroom_map.items()},
        "teacher_schedules": {tid: {"name": t.name, "final_allocation": t.teacherSchedule}
                              for tid, t in teachers_map.items()}
    }

    output_filename = "final_schedules.json"
    try:
        with open(output_filename, 'w') as f:
            json.dump(final_schedules, f, indent=4)
        print(f"\n✅ Successfully wrote final schedules to {output_filename}")
    except IOError:
        print(f"\n❌ Error: Could not write to file {output_filename}.")


def main():
    # Load data using the specialized teacher set and the empty allocation grid
    teacher_raw_data = load_data('backend/teacher.json')
    classroom_raw_data = load_data('backend/sample2.json')

    teachers_map = init_teachers(teacher_raw_data)
    classroom_map = init_classroom(classroom_raw_data)

    # --- Run Automated Allocation Loop for ALL Classes ---
    print("\n--- Starting Automated Allocation for ALL Classes ---")

    for classroom_id, classroom_obj in classroom_map.items():
        print(f"\nScheduling Class: {classroom_obj.name}")

        while True:
            # Attempt to allocate ONE single period
            success = allocate_single_period(classroom_obj, teachers_map)

            # Check if all demands are now met
            remaining_total = sum(classroom_obj.remaining_periods.values())

            if remaining_total == 0:
                print(
                    f"✅ Success! All periods allocated for {classroom_obj.name}.")
                break

            if not success:
                # Allocation failed for the last requested subject
                print(
                    f"❌ Allocation halted. Cannot place remaining {remaining_total} periods for {classroom_obj.name}.")
                break

    # --- Write the final schedules to a file ---
    write_schedules_to_json(classroom_map, teachers_map)

    # --- Display final state for verification ---
    print("\n--- FINAL ALLOCATION RESULTS ---")
    for classroom_id, classroom_obj in classroom_map.items():
        print(
            f"\n{classroom_obj.name} Final Demand: {classroom_obj.remaining_periods}")


if __name__ == "__main__":
    main()
