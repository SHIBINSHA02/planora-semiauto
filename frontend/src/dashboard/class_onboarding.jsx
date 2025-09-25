import React, { useState } from 'react';

const ClassOnboarding = () => {
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      className: className.trim(),
      teacherName,
      subject,
      count: count ? Number(count) : 0,
      adminEmail: adminEmail.trim(),
    };
    console.log('Class Onboarding Submit:', payload);
    // TODO: wire up API submission here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-300">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name"
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Teacher</label>
          <select
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          >
            <option value="" disabled>Select a teacher</option>
            <option value="Alice Johnson">Alice Johnson</option>
            <option value="Brian Lee">Brian Lee</option>
            <option value="Chitra Patel">Chitra Patel</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          >
            <option value="" disabled>Select a subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Count</label>
          <input
            type="number"
            min="0"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="0"
            className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">Admin Email</label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Enter admin email"
          className="w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
        />
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

export default ClassOnboarding;
