import React, { useState } from 'react';

const TeacherOnboarding = () => {
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState([]);

  const handleAddSubject = () => {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    // prevent duplicates (case-insensitive)
    const exists = subjects.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setSubjectInput('');
      return;
    }
    setSubjects(prev => [...prev, trimmed]);
    setSubjectInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = teacherName.trim();
    const trimmedEmail = teacherEmail.trim();
    if (!trimmedName || !trimmedEmail || subjects.length === 0) {
      alert('Please fill name, email, and at least one subject.');
      return;
    }

    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    const payload = {
      teachername: trimmedName,
      mailid: trimmedEmail,
      subjects: subjects,
    };

    try {
      const res = await fetch(`${API_BASE}/timetable/add_teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to add teacher');
      }

      // reset form on success
      setTeacherName('');
      setTeacherEmail('');
      setSubjects([]);
      alert('Teacher added successfully');
    } catch (err) {
      console.error('Add teacher failed:', err);
      alert('Failed to add teacher');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Teacher Name</label>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="Enter teacher name"
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Teacher Email</label>
        <input
          type="email"
          value={teacherEmail}
          onChange={(e) => setTeacherEmail(e.target.value)}
          placeholder="Enter teacher email"
          className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Subjects</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Add a subject"
            className="flex-1 rounded-md bg-white border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubject();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSubject}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 rounded-md transition-colors duration-200 shadow"
          >
            Add
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {subjects.map((s, idx) => (
              <span
                key={`${s}-${idx}`}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 text-gray-800 text-sm px-3 py-1"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default TeacherOnboarding;
