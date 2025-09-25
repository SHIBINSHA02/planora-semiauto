import React from 'react';

const DownloadPanel = () => {
  const handleDownloadTeacherSchedule = () => {
    // TODO: Implement download teacher schedule functionality
    console.log('Download teacher schedule clicked');
  };

  const handleDownloadClassSchedules = () => {
    // TODO: Implement download class schedules functionality
    console.log('Download class schedules clicked');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={handleDownloadTeacherSchedule}
        className="bg-purple-800 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Download Teacher Schedule
      </button>
      
      <button
        onClick={handleDownloadClassSchedules}
        className="bg-purple-800 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Download Class Schedules
      </button>
    </div>
  );
};

export default DownloadPanel;
