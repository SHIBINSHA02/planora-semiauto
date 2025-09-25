# Timetable API Reference

Base URL: http://127.0.0.1:5000

All endpoints are CORS-enabled for development.

## Authentication

Currently, the timetable endpoints do not require authentication. There is an /auth blueprint present for future use.

## Data Models (DB)

- Teacher
  - id: integer
  - teachername: string
  - mailid: string
  - subjects: relation to Subject (names collected for output)

- Subject
  - id: integer
  - name: string
  - teacher_id: integer (FK Teacher.id)

- Classroom
  - id: integer
  - classroom_id: integer (unique, public id used in API)
  - classroom: string (display name)
  - admin_email: string
  - subject_details: JSON object mapping subject -> weekly count (e.g. { "Mathematics": 5 })
  - allocation: JSON 5x6 grid of slots; each slot is either null, a single assignment object { subject, teacher_id }, or an array of such objects to support multi-teacher slots

## Endpoints (prefix: /timetable)

### List Teachers
GET /timetable/teachers

Response:
```json
{
  "teachers": [
    { "id": 1, "teachername": "Alice", "mailid": "alice@example.com", "subjects": ["Math", "Physics"] }
  ]
}
```

### Add Teacher
POST /timetable/add_teacher

Request:
```json
{
  "teachername": "Alice",
  "mailid": "alice@example.com",
  "subjects": ["Math", "Physics"]
}
```
Response 201:
```json
{ "message": "Teacher added successfully" }
```

### Onboard Classroom
POST /timetable/classrooms/onboard

Request:
```json
{
  "classname": "CSE S7 R1",
  "admin": "admin@example.com",
  "subjects": [
    { "subject": "Mathematics", "teachername": "Alice Johnson", "time": 5 },
    { "subject": "Science", "teachername": "Brian Lee", "time": 3 }
  ]
}
```
Notes:
- Initializes a 5x6 allocation grid filled with nulls
- Aggregates subject_details from subjects entries based on time

Response 201:
```json
{
  "message": "Classroom onboarded successfully",
  "classroom_id": 1,
  "classroom": "CSE S7 R1",
  "admin_email": "admin@example.com",
  "subject_details": { "Mathematics": 5, "Science": 3 },
  "allocation": [[null, null, null, null, null, null], [null, null, null, null, null, null], [null, null, null, null, null, null], [null, null, null, null, null, null], [null, null, null, null, null, null]]
}
```

### List Classrooms
GET /timetable/classrooms

Response:
```json
{
  "classrooms": [
    { "id": 1, "classroom_id": 1, "classroom": "CSE S7 R1", "admin_email": "admin@example.com" }
  ]
}
```

### Get Classroom by ID
GET /timetable/classrooms/{classroom_id}

Response:
```json
{
  "classroom_id": 1,
  "classroom": "CSE S7 R1",
  "admin_email": "admin@example.com",
  "subject_details": { "Mathematics": 5, "Science": 3 },
  "allocation": [
    [ null, [{ "subject": "Mathematics", "teacher_id": 2 }], null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ]
  ]
}
```

### Get Classroom by Name (legacy)
GET /timetable/classroom/{classname}

Response: same as Get Classroom by ID, using classroom name lookup.

### Get Subjects for Classroom
GET /timetable/classrooms/{classroom_id}/subjects

Response:
```json
{ "subjects": ["Mathematics", "Science", "English"] }
```

### Update Full Slot (assignments list)
PATCH /timetable/classrooms/{classroom_id}/slot

Request:
```json
{
  "dayIndex": 0,
  "periodIndex": 1,
  "assignments": [
    { "subject": "Mathematics", "teacher_id": 2 }
  ]
}
```
Response:
```json
{ "message": "Slot updated", "allocation": [ ... updated 5x6 grid ... ] }
```

### Add Single Assignment to Slot (multi-teacher)
POST /timetable/classrooms/{classroom_id}/slot/assignments/add

Request:
```json
{ "dayIndex": 0, "periodIndex": 1, "assignment": { "subject": "Mathematics", "teacher_id": 2 } }
```
Response:
```json
{ "message": "Assignment added", "allocation": [ ... ] }
```

### Remove Single Assignment from Slot
POST /timetable/classrooms/{classroom_id}/slot/assignments/remove

Request (any of teacher_id/subject may be provided to match):
```json
{ "dayIndex": 0, "periodIndex": 1, "teacher_id": 2 }
```
Response:
```json
{ "message": "Assignment removed", "allocation": [ ... ] }
```

### Update Slot Subject Only
PATCH /timetable/classrooms/{classroom_id}/slot/subject

Request:
```json
{ "dayIndex": 0, "periodIndex": 1, "subject": "Mathematics" }
```
Response:
```json
{ "message": "Subject updated", "allocation": [ ... ] }
```

### Update Slot Teacher Only
PATCH /timetable/classrooms/{classroom_id}/slot/teacher

Request:
```json
{ "dayIndex": 0, "periodIndex": 1, "teacher_id": 2 }
```
Response:
```json
{ "message": "Teacher updated", "allocation": [ ... ] }
```

### Get Available Teachers for a Slot
GET /timetable/teachers/available

Query Params:
- classroom_id (required)
- day (0-4, required)
- period (0-5, required)
- subject (optional)

Response:
```json
{
  "teachers": [
    { "id": 2, "teachername": "Alice Johnson", "mailid": "alice@example.com", "subjects": ["Mathematics"] }
  ]
}
```

### Check Teacher Availability
GET /timetable/teachers/{teacher_id}/availability

Query Params:
- day (0-4, required)
- period (0-5, required)
- classroom_id (optional, used to exclude current classroom when checking conflicts)
- subject (optional, validates capability if provided)

Response:
```json
{ "available": true }
```

### Get Single-Value Teacher Schedule Grid (5x6)
GET /timetable/teachers/{teacher_id}/schedule

Response:
```json
{
  "teacher_id": 2,
  "grid": [
    [ null, { "classroomId": 1, "classroomName": "CSE S7 R1", "subject": "Mathematics" }, null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ],
    [ null, null, null, null, null, null ]
  ]
}
```

### Auto-generate Schedule (stub)
POST /timetable/classrooms/{classroom_id}/auto_generate

Response:
```json
{ "message": "Auto-generate completed", "allocation": [ ... 5x6 grid ... ] }
```

## Notes on Allocation Schema
- allocation is always a 5x6 JSON array of arrays (5 days x 6 periods)
- Each cell is one of:
  - null (no assignment)
  - Object: { "subject": string, "teacher_id": number } (legacy form)
  - Array of objects: [{ "subject": string, "teacher_id": number }, ...] (supports multi-teacher)

The write endpoints normalize updates to the array form. Frontend should be ready to handle both forms when reading.

## Example Flow (Frontend)
1) Load data
- GET /timetable/classrooms
- GET /timetable/teachers
- For each classroom: GET /timetable/classrooms/{id}
- Optionally: GET /timetable/classrooms/{id}/subjects

2) Editing a slot (subject then teacher)
- PATCH /timetable/classrooms/{id}/slot/subject with { dayIndex, periodIndex, subject }
- PATCH /timetable/classrooms/{id}/slot/teacher with { dayIndex, periodIndex, teacher_id }
- Refresh: GET /timetable/classrooms/{id} to update local view

3) Showing availability
- GET /timetable/teachers/available?classroom_id=1&day=0&period=1&subject=Mathematics
- GET /timetable/teachers/{teacher_id}/availability?day=0&period=1&classroom_id=1

## Error Codes
- 400: Invalid or missing parameters
- 404: Resource not found (e.g., classroom or teacher)
- 201: Created (onboarding and add teacher)
- 200: OK

## Versioning
This is v1 of the API; path versioning is not yet applied. Backwards-incompatible changes will bump a version prefix when introduced.
