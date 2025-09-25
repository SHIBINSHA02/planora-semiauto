import React from 'react';
import ClassroomScheduleView from '../components/ClassroomScheduleView';
import ErrorBoundary from '../components/ErrorBoundary';
import { TimetableAPI } from '../api/timetable';

const Classroom = () => {
  const [classrooms, setClassrooms] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [classSchedules, setClassSchedules] = React.useState({});
  const teacherSchedules = {};
  const [selectedClassroom, setSelectedClassroom] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const [{ classrooms: cls }, { teachers: t }] = await Promise.all([
          TimetableAPI.listClassrooms(),
          TimetableAPI.getTeachers(),
        ]);
        setClassrooms(cls.map(c => ({ id: c.classroom_id, name: c.classroom, grade: c.classroom, division: '' })));
        setTeachers(t);
        // Preload schedules for all classrooms
        const entries = await Promise.all(
          cls.map(async (c) => {
            const data = await TimetableAPI.getClassroomById(c.classroom_id);
            return [String(c.classroom_id), data.allocation || []];
          })
        );
        setClassSchedules(Object.fromEntries(entries));
      } catch (e) {
        // swallow
      }
    })();
  }, []);

  const updateSchedule = async (classroomId, dayIndex, periodIndex, teacherId, subject) => {
    const assignments = teacherId ? [{ teacher_id: parseInt(teacherId), subject }] : [];
    await TimetableAPI.updateSlot({ classroomId, dayIndex, periodIndex, assignments });
    // refresh in memory
    const updated = await TimetableAPI.getClassroomById(classroomId);
    setClassSchedules(prev => ({ ...prev, [String(classroomId)]: updated.allocation || [] }));
    return true;
  };

  const getAvailableTeachers = async (classroomId, dayIndex, periodIndex, subject) => {
    const { teachers: available } = await TimetableAPI.getAvailableTeachersForSlot({ classroomId, dayIndex, periodIndex, subject });
    return available;
  };

  const getTeachersForSubject = (grade, subject) => {
    return teachers.filter(t => (t.subjects || []).includes(subject));
  };

  const getSubjectsForClass = (grade) => {
    // If a class is selected, prefer backend subject_details keys
    const id = parseInt(selectedClassroom);
    if (id && classrooms.length > 0) {
      const match = classrooms.find(c => c.id === id);
      if (match) {
        // We don't have subject_details here; fallback to union of teacher subjects
        const set = new Set();
        (teachers || []).forEach(t => (t.subjects || []).forEach(s => set.add(s)));
        return Array.from(set);
      }
    }
    const set = new Set();
    (teachers || []).forEach(t => (t.subjects || []).forEach(s => set.add(s)));
    return Array.from(set);
  };

  const isTeacherAvailable = async (teacherId, dayIndex, periodIndex, classroomId) => {
    const { available } = await TimetableAPI.isTeacherAvailable({ teacherId, dayIndex, periodIndex, classroomId });
    return available;
  };

  const autoGenerateSchedule = async (classroomId) => {
    await TimetableAPI.autoGenerate(classroomId);
    const updated = await TimetableAPI.getClassroomById(classroomId);
    setClassSchedules(prev => ({ ...prev, [String(classroomId)]: updated.allocation || [] }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Classroom</h1>
      <ErrorBoundary>
        <ClassroomScheduleView
          classrooms={classrooms}
          teachers={teachers}
          classSchedules={classSchedules}
          teacherSchedules={teacherSchedules}
          selectedClassroom={selectedClassroom}
          setSelectedClassroom={setSelectedClassroom}
          updateSchedule={updateSchedule}
          getAvailableTeachers={getAvailableTeachers}
          getTeachersForSubject={getTeachersForSubject}
          getSubjectsForClass={getSubjectsForClass}
          isTeacherAvailable={isTeacherAvailable}
          autoGenerateSchedule={autoGenerateSchedule}
        />
      </ErrorBoundary>
    </div>
  );
};

export default Classroom;

