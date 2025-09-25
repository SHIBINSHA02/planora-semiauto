import React from 'react';
import ScheduleTable from '../components/ScheduleTable';

const Teacher = () => {
  // Placeholder demo for teacher view; replace with real data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
  const scheduleData = Array(days.length).fill(0).map(() => Array(periods.length).fill(null));

  const teachers = [];
  const teacherSchedules = {};
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
        <div className="relative w-[400px]">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className={`w-full appearance-none rounded-md bg-white border border-gray-300 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${
              selectedTeacherId ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <option value="" disabled>Select a teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.114l3.71-3.884a.75.75 0 111.08 1.04l-4.24 4.44a.75.75 0 01-1.08 0l-4.24-4.44a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
      <div className="mb-2 text-gray-700">Weekly schedule overview</div>
      <ScheduleTable
        scheduleData={scheduleData}
        days={days}
        periods={periods}
        teachers={teachers}
        onUpdateSchedule={() => {}}
        type="teacher"
        teacherSchedules={teacherSchedules}
      />
    </div>
  );
};

export default Teacher;

