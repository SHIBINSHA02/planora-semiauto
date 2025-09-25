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

    output_filename = "backend/auto/gen_schedule.json"
    try:
        with open(output_filename, 'w') as f:
            json.dump(final_schedules, f, indent=4)
        print(f"\n✅ Successfully wrote final schedules to {output_filename}")
    except IOError:
        print(f"\n❌ Error: Could not write to file {output_filename}.")


def check_for_infeasibility(classroom_obj):
    """
    Checks if remaining demand is impossible to meet due to:
    1. Max Periods Per Day Constraint (Max 2).
    2. Zero remaining slots for the class.
    """

    # 1. Total Slot Check (Resource Bottleneck)
    total_periods_assigned = sum(classroom_obj.subject_details.values(
    )) - sum(classroom_obj.remaining_periods.values())
    if total_periods_assigned >= 30:  # Max slots in a 5x6 grid
        return "SLOT_SATURATION"

    # 2. Max Periods Per Day Check (Constraint Impossibility)
    for subject, required_count in classroom_obj.remaining_periods.items():
        if required_count > 0:

            # Count how many days the subject is currently scheduled < 2 times
            available_slots_left = 0
            for day_index in range(5):
                # Count current placements on this day
                current_count = sum(1 for assignment in classroom_obj.classroomSchedule[day_index]
                                    if assignment is not None and assignment.get('subject') == subject)

                # Add potential slots (2 minus what's currently scheduled)
                available_slots_left += (2 - current_count)

            # Check against total required periods
            if required_count > available_slots_left:
                return f"MAX_PERIODS_EXCEEDED_FOR_{subject}"

    return None  # Schedule is still feasible


MAX_ATTEMPTS = 1000


def main():
    # --- STATIC INITIALIZATION (Runs ONLY once) ---
    teacher_raw_data = load_data('backend/teacher.json')
    classroom_raw_data = load_data('backend/sample.json')

    # --- THE RETRY LOOP ---
    for attempt in range(1, MAX_ATTEMPTS + 1):
        print(f"\n--- ATTEMPT {attempt} of {MAX_ATTEMPTS} ---")

        # 1. WORKING STATE INITIALIZATION (Resets for every attempt)
        # Create fresh, empty Teacher and Classroom objects for the new try.
        teachers_map = init_teachers(teacher_raw_data)
        classroom_map = init_classroom(classroom_raw_data)

        successful_run = True

        # 2. ALLOCATION LOGIC (The attempt to build the schedule)
        for classroom_id, classroom_obj in classroom_map.items():
            print(f"Scheduling Class: {classroom_obj.name}")

            # Loop to schedule all required single periods for this class
            while True:
                success = allocate_single_period(classroom_obj, teachers_map)

                remaining_total = sum(classroom_obj.remaining_periods.values())

                if remaining_total == 0:
                    break  # Class is fully scheduled

                if not success:
                    # Allocation failure occurred for a subject. Test feasibility.
                    infeasibility_reason = check_for_infeasibility(
                        classroom_obj)

                    if infeasibility_reason:
                        # Log the fatal constraint violation and stop this attempt.
                        print(
                            f"❌ FATAL INFEASIBILITY detected for {classroom_obj.name}: {infeasibility_reason}")
                        successful_run = False
                        break
                    else:
                        # Failed due to poor randomization, but still feasible. Break the inner loop
                        # to allow the outer retry loop to start a new, random attempt.
                        successful_run = False
                        break

            if not successful_run:
                break  # If one class fails, stop the outer class loop and start a new attempt

        # 3. CHECK & TERMINATE
        # We need the final remaining total across ALL classes
        grand_remaining_total = sum(
            sum(c.remaining_periods.values()) for c in classroom_map.values()
        )

        if successful_run and grand_remaining_total == 0:
            print(
                f"✅ FINAL SUCCESS! Timetable generated in {attempt} attempts.")
            write_schedules_to_json(classroom_map, teachers_map)
            return  # Exit the entire program upon success

        # If unsuccessful, the loop simply increments 'attempt' and tries again.
        print(
            f"❌ Attempt {attempt} failed. Grand Remaining: {grand_remaining_total}. Retrying...")

    print(
        f"\nFATAL ERROR: Could not find a feasible timetable within {MAX_ATTEMPTS} attempts.")


if __name__ == "__main__":
    main()
