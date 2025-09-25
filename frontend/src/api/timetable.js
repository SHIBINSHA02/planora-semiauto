const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

async function http(method, path, { params, body } = {}) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export const TimetableAPI = {
  getTeachers: () => http('GET', '/timetable/teachers'),
  listClassrooms: () => http('GET', '/timetable/classrooms'),
  getClassroomById: (classroomId) => http('GET', `/timetable/classrooms/${classroomId}`),
  getSubjectsForClassroom: (classroomId) => http('GET', `/timetable/classrooms/${classroomId}/subjects`),
  getAvailableTeachersForSlot: ({ classroomId, dayIndex, periodIndex, subject }) =>
    http('GET', '/timetable/teachers/available', {
      params: { classroom_id: classroomId, day: dayIndex, period: periodIndex, subject },
    }),
  isTeacherAvailable: ({ teacherId, dayIndex, periodIndex, subject, classroomId }) =>
    http('GET', `/timetable/teachers/${teacherId}/availability`, {
      params: { day: dayIndex, period: periodIndex, subject, classroom_id: classroomId },
    }),
  updateSlot: ({ classroomId, dayIndex, periodIndex, assignments }) =>
    http('PATCH', `/timetable/classrooms/${classroomId}/slot`, {
      body: { dayIndex, periodIndex, assignments },
    }),
  autoGenerate: (classroomId) => http('POST', `/timetable/classrooms/${classroomId}/auto_generate`),
  onboardClassroom: ({ classname, admin, subjects }) =>
    http('POST', '/timetable/classrooms/onboard', { body: { classname, admin, subjects } }),
};

export default TimetableAPI;


