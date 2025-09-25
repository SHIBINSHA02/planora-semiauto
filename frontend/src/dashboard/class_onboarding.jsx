import React, { useEffect, useMemo, useState } from 'react';
import { TimetableAPI } from '../api/timetable';

const ClassOnboarding = () => {
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState(["Mathematics", "Science", "English"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { teachers: t } = await TimetableAPI.getTeachers();
        setTeachers(t);
      } catch (_) {
        setTeachers([]);
      }
    })();
  }, []);

  const teacherNames = useMemo(() => teachers.map(t => t.teachername), [teachers]);

  // Update subjects list when teacher changes to show only that teacher's subjects
  useEffect(() => {
    if (!teacherName) {
      return;
    }
    const t = teachers.find(x => x.teachername === teacherName);
    if (t && Array.isArray(t.subjects) && t.subjects.length > 0) {
      setSubjects(t.subjects);
      // If current subject not in teacher's list, reset it
      if (!t.subjects.includes(subject)) {
        setSubject('');
      }
    }
  }, [teacherName, teachers]);

  const handleAddTeacher = () => {
    const trimmedTeacher = String(teacherName || '').trim();
    const trimmedSubject = String(subject || '').trim();
    const numericCount = count ? Number(count) : 0;

    // Validate teacher and subject mapping from onboarded teachers
    const selectedTeacher = teachers.find(x => x.teachername === trimmedTeacher);
    const allowedSubjects = Array.isArray(selectedTeacher?.subjects) ? selectedTeacher.subjects : [];

    if (!trimmedTeacher || !trimmedSubject || numericCount <= 0) {
      return;
    }

    if (allowedSubjects.length > 0 && !allowedSubjects.includes(trimmedSubject)) {
      alert('Selected subject is not taught by this teacher.');
      return;
    }

    setAssignedTeachers(prev => [
      ...prev,
      { teacherName: trimmedTeacher, subject: trimmedSubject, count: numericCount },
    ]);

    // clear fields after adding
    setTeacherName('');
    setSubject('');
    setCount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedClass = className.trim();
    const trimmedAdmin = adminEmail.trim();
    if (!trimmedClass || !trimmedAdmin || assignedTeachers.length === 0) {
      alert('Please fill class name, admin email, and add at least one teacher entry.');
      return;
    }

    // transform assignedTeachers to backend schema: subjects
    const subjectsPayload = assignedTeachers.map((t) => ({
      subject: t.subject,
      teachername: t.teacherName,
      time: Number(t.count) || 0,
    }));

    try {
      setIsSubmitting(true);
      await TimetableAPI.onboardClassroom({ classname: trimmedClass, admin: trimmedAdmin, subjects: subjectsPayload });
      // reset form on success
      setClassName('');
      setTeacherName('');
      setSubject('');
      setCount('');
      setAdminEmail('');
      setAssignedTeachers([]);
      alert('Class schedule added successfully');
    } catch (err) {
      console.error('Add schedule failed:', err);
      alert('Failed to add schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className={`w-full rounded-md bg-white border border-gray-300 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
              teacherName ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <option value="" disabled>Select a teacher</option>
            {teacherNames.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`w-full rounded-md bg-white border border-gray-300 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
              subject ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <option value="" disabled>Select a subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Count</label>
          <input
            type="number"
            min="0"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="0"
            className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={handleAddTeacher}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow"
        >
          Add
        </button>
      </div>

      {assignedTeachers.length > 0 && (
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Added Teachers</h3>
          <ul className="space-y-1">
            {assignedTeachers.map((t, idx) => (
              <li key={`${t.teacherName}-${t.subject}-${idx}`} className="text-sm text-gray-700">
                {t.teacherName} — {t.subject} — {t.count}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Admin Email</label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Enter admin email"
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${isSubmitting ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-semibold py-3 rounded-lg transition-colors duration-200 shadow`}
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default ClassOnboarding;
