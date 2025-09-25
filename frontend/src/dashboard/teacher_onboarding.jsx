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

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      teacherName: teacherName.trim(),
      teacherEmail: teacherEmail.trim(),
      subjects,
    };
    console.log('Teacher Onboarding Submit:', payload);
    // TODO: wire up API submission here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-300">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Teacher Name</label>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="Enter teacher name"
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Teacher Email</label>
        <input
          type="email"
          value={teacherEmail}
          onChange={(e) => setTeacherEmail(e.target.value)}
          placeholder="Enter teacher email"
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Subjects</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Add a subject"
            className="flex-1 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
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
            className="shrink-0 bg-purple-800 hover:bg-purple-700 text-white font-semibold px-4 rounded-md transition-colors duration-200 shadow"
          >
            Add
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {subjects.map((s, idx) => (
              <span
                key={`${s}-${idx}`}
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 text-gray-100 text-sm px-3 py-1"
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
          className="w-full bg-purple-800 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default TeacherOnboarding;
