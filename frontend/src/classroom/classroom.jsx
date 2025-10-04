// frontend/src/classroom/classroom.jsx
import React from 'react';
import ClassroomScheduleView from '../components/ClassroomScheduleView';
import ErrorBoundary from '../components/ErrorBoundary';
import { TimetableAPI } from '../api/timetable';

const Classroom = () => {
  const [classrooms, setClassrooms] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [classSchedules, setClassSchedules] = React.useState({});
  const [classSubjects, setClassSubjects] = React.useState({});
  const [teacherSchedules, setTeacherSchedules] = React.useState({});
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
        const schedulesMap = Object.fromEntries(entries);
        setClassSchedules(schedulesMap);
        // Build teacherSchedules map from all class schedules
        const ts = {};
        Object.entries(schedulesMap).forEach(([clsId, grid]) => {
          (grid || []).forEach((day, dayIndex) => {
            (day || []).forEach((cell, periodIndex) => {
              const assignments = Array.isArray(cell) ? cell : (cell ? [cell] : []);
              assignments.forEach(assign => {
                if (!assign) return;
                const teacherId = assign.teacher_id != null ? assign.teacher_id : assign.teacherId;
                if (teacherId == null) return;
                if (!ts[teacherId]) ts[teacherId] = Array(5).fill(null).map(() => Array(6).fill(null));
                ts[teacherId][dayIndex][periodIndex] = {
                  classroomId: Number(clsId),
                  classroomName: (classrooms.find(c => c.id === Number(clsId))?.name) || '',
                  subject: assign.subject || '',
                  grade: '',
                };
              });
            });
          });
        });
        setTeacherSchedules(ts);

        const subjectsEntries = await Promise.all(
          cls.map(async (c) => {
            const s = await TimetableAPI.getSubjectsForClassroom(c.classroom_id);
            return [String(c.classroom_id), s.subjects || []];
          })
        );
        setClassSubjects(Object.fromEntries(subjectsEntries));
      } catch (e) {
        // swallow
      }
    })();
  }, []);

  const updateSchedule = async (classroomId, dayIndex, periodIndex, teacherId, subject) => {
    // Perform separate updates to subject and teacher to satisfy backend contract
    if (subject !== undefined) {
      await TimetableAPI.updateSlotSubject({ classroomId, dayIndex, periodIndex, subject });
    }
    if (teacherId !== undefined) {
      await TimetableAPI.updateSlotTeacher({ classroomId, dayIndex, periodIndex, teacherId: teacherId ? parseInt(teacherId) : null });
    }
    // refresh in memory
    const updated = await TimetableAPI.getClassroomById(classroomId);
    setClassSchedules(prev => {
      const next = { ...prev, [String(classroomId)]: updated.allocation || [] };
      // Rebuild affected teacher schedules for this classroom only
      const ts = { ...teacherSchedules };
      // Clear previous assignments for this classroom in ts
      Object.keys(ts).forEach(tid => {
        for (let d = 0; d < 5; d++) {
          for (let p = 0; p < 6; p++) {
            const slot = ts[tid]?.[d]?.[p];
            if (slot && slot.classroomId === classroomId) {
              ts[tid][d][p] = null;
            }
          }
        }
      });
      const grid = updated.allocation || [];
      grid.forEach((day, d) => {
        (day || []).forEach((cell, p) => {
          const assigns = Array.isArray(cell) ? cell : (cell ? [cell] : []);
          assigns.forEach(a => {
            if (!a) return;
            const tid = a.teacher_id != null ? a.teacher_id : a.teacherId;
            if (tid == null) return;
            if (!ts[tid]) ts[tid] = Array(5).fill(null).map(() => Array(6).fill(null));
            ts[tid][d][p] = {
              classroomId,
              classroomName: (classrooms.find(c => c.id === classroomId)?.name) || '',
              subject: a.subject || '',
              grade: '',
            };
          });
        });
      });
      setTeacherSchedules(ts);
      return next;
    });
    return true;
  };

  const getAvailableTeachers = async (classroomId, dayIndex, periodIndex, subject) => {
    const { teachers: available } = await TimetableAPI.getAvailableTeachersForSlot({ classroomId, dayIndex, periodIndex, subject });
    return available;
  };

  const getTeachersForSubject = (grade, subject) => {
    return teachers.filter(t => (t.subjects || []).includes(subject));
  };

  const getSubjectsForClass = () => {
    const id = parseInt(selectedClassroom);
    if (id && classSubjects[String(id)]) return classSubjects[String(id)];
    // fallback: all unique subjects teachers can teach
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

