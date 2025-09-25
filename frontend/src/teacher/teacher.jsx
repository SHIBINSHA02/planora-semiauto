import React from 'react';
import ScheduleTable from '../components/ScheduleTable';

const Teacher = () => {
  // Placeholder demo for teacher view; replace with real data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
  const scheduleData = Array(days.length).fill(0).map(() => Array(periods.length).fill(null));

  const teachers = [];
  const teacherSchedules = {};

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher</h1>
      <div className="mb-4 text-gray-700">Weekly schedule overview</div>
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

