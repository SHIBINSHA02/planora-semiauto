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
            classroomSchedule=[[None for _ in range(6)] for _ in range(5)]
            # classroomSchedule=data['allocation']
        )

        classroom_map[data['classroom_id']] = classroom_Obx

    return classroom_map


def find_available_teacher(subject, teachers_map, day_index, period_index):
    """
    Returns a list of Teacher objects qualified for the subject AND free 
    at the specified day/period. Prioritizes low-ID teachers (simple weighting).
    """
    available_teachers = []

    # Iterate over Teacher objects
    for teacher_id, teacher_obj in teachers_map.items():
        # 1. Check Subject Qualification
        if subject in teacher_obj.subjects:

            # 2. Check Teacher Availability (Hard Constraint: No Conflict)
            if teacher_obj.teacher_is_free(day_index, period_index):
                available_teachers.append(teacher_obj)

    # Use a basic greedy selection (e.g., sort by ID, assuming lower ID is preferred/simpler)
    # The lowest ID teacher will be at the front after sorting.
    available_teachers.sort(key=lambda t: t.teacher_id)

    return available_teachers


# FILE: backend/main.py (New Allocation Function)

def allocate_single_period(classroom_obj, teachers_map):
    """
    Randomly selects a day/period and attempts to allocate a single, 
    unassigned period from the remaining demand.
    """

    # --- 1. Identify Subject Demand (What to schedule) ---
    # Find a subject that still needs periods assigned
    subject_to_schedule = None

    # Simple priority: Iterate over subjects and pick the first one with remaining demand
    for subject, count in classroom_obj.remaining_periods.items():
        if count > 0:
            subject_to_schedule = subject
            break

    if subject_to_schedule is None:
        return False  # No more periods to schedule for this class

    # --- 2. Random Day/Period Selection (Where to schedule) ---
    days = [0, 1, 2, 3, 4]
    periods = [0, 1, 2, 3, 4, 5]

    # Shuffle to ensure a randomized greedy approach
    random.shuffle(days)
    random.shuffle(periods)

    for day_index in days:
        for period_index in periods:

            # --- 3. Hard Constraint Check 1: Class Availability ---
            if not classroom_obj.classroom_is_free(day_index, period_index):
                continue  # Slot is already taken, try next period

            # --- 4. Hard Constraint Check 2: Teacher Availability ---
            # Get all teachers qualified AND free at this random slot
            available_teachers = find_available_teacher(
                subject_to_schedule, teachers_map, day_index, period_index)

            if available_teachers:
                # Select the best available teacher (first one due to simple sort/weighting)
                teacher_obj = available_teachers[0]
                teacher_id = teacher_obj.teacher_id

                # **SOFT CONSTRAINT CHECK (Minimal Example):** # Check the consecutive period constraint BEFORE assignment
                # (For simplicity, we'll skip the actual 3-consecutive-check here,
                # but this is where it would be placed)

                # --- 5. ALLOCATION: Parallel Update ---

                # A. Update Class Grid
                classroom_obj.add_classroom_schedule(
                    day_index, period_index, subject_to_schedule, teacher_id)

                # B. Update Teacher Grid (Parallel Update)
                classroom_name = classroom_obj.name
                teacher_obj.add_teacher_schedule(
                    day_index, period_index, classroom_name, subject_to_schedule)

                # C. Update Demand Counter
                classroom_obj.decrement_period_count(subject_to_schedule, 1)

                return True

    return False


def populate_existing_schedules(classroom_raw_data, classroom_map, teachers_map):
    """
    Initializes Teacher and Classroom grids and updates remaining periods 
    based on the existing 'allocation' data from raw JSON.
    """
    for class_id, raw_data in classroom_raw_data.items():
        classroom_obj = classroom_map[raw_data['classroom_id']]
        class_name = raw_data['classroom']
        allocation_grid = raw_data['allocation']  # Use the raw allocation data

        # Iterate over Day (i) and Period (j) - 5 days x 6 periods
        for day_index, day_schedule in enumerate(allocation_grid):
            for period_index, assignments in enumerate(day_schedule):

                if assignments is not None:
                    # Assignments is a list of dicts for this slot (multiple activities)
                    for assignment in assignments:
                        subject = assignment['subject']
                        teacher_id = assignment['teacher_id']

                        teacher_obj = teachers_map.get(teacher_id)

                        if teacher_obj:
                            # 1. Update Teacher Grid (Marks teacher as busy)
                            teacher_obj.add_teacher_schedule(
                                day=day_index,
                                period=period_index,
                                classroom=class_name,
                                subject=subject
                            )

                            # 2. Update Classroom Grid (Marks class as busy)
                            # We must manually place the data here since init_classroom skipped it
                            classroom_obj.add_classroom_schedule(
                                day_index, period_index, subject, teacher_id
                            )

                            # 3. Update Remaining Periods (Crucial step for demand tracking)
                            classroom_obj.decrement_period_count(subject, 1)

    return classroom_map, teachers_map


def write_schedules_to_json(classroom_map, teachers_map):
    """
    Writes the final schedules for classrooms and teachers to a JSON file.
    """
    final_schedules = {
        "class_schedules": {},
        "teacher_schedules": {}
    }

    # Extract classroom schedules
    for classroom_id, classroom_obj in classroom_map.items():
        final_schedules["class_schedules"][classroom_id] = {
            "name": classroom_obj.name,
            "final_allocation": classroom_obj.classroomSchedule
        }

    # Extract teacher schedules
    for teacher_id, teacher_obj in teachers_map.items():
        final_schedules["teacher_schedules"][teacher_id] = {
            "name": teacher_obj.name,
            "final_allocation": teacher_obj.teacherSchedule
        }

    # Write the combined data to a file
    output_filename = "final_schedules.json"
    try:
        with open(output_filename, 'w') as f:
            json.dump(final_schedules, f, indent=4)
        print(f"\n✅ Successfully wrote final schedules to {output_filename}")
    except IOError:
        print(f"\n❌ Error: Could not write to file {output_filename}.")


def main():
    teacher_raw_data = load_data('backend/teacher.json')
    classroom_raw_data = load_data('backend/sample2.json')

    teachers_map = init_teachers(teacher_raw_data)
    classroom_map = init_classroom(classroom_raw_data)

    # Initialize State from Existing Allocation
    # This must be done FIRST to correctly set the 'remaining_periods' and 'teacherSchedule'
    classroom_map, teachers_map = populate_existing_schedules(
        classroom_raw_data, classroom_map, teachers_map
    )

    # Run Automated Allocation Loop
    print("\n--- Starting Automated Allocation ---")

    # Simple loop: Only allocate periods for Classroom 1 (CSE S7 R1)
    classroom_obj = classroom_map[1]

    while True:
        # Attempt to allocate ONE single period
        success = allocate_single_period(classroom_obj, teachers_map)

        # Check if all demands are now met (remaining periods = 0 for all)
        all_done = all(
            count <= 0 for count in classroom_obj.remaining_periods.values())

        if all_done:
            print(
                f"✅ Success! All periods allocated for {classroom_obj.name}.")
            break

        if not success:
            # Failed to place the last requested subject anywhere in the grid
            print(f"❌ Allocation halted. Cannot place remaining periods.")
            break

    write_schedules_to_json(classroom_map, teachers_map)

    # --- Step 3: Display Final State ---
    print("\n--- FINAL REMAINING DEMAND ---")
    print(classroom_obj.remaining_periods)

    print("\n--- FINAL CLASS SCHEDULE (Day 0) ---")
    print(classroom_obj.classroomSchedule[0])


if __name__ == "__main__":
    main()
