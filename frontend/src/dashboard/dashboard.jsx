import React from 'react';
import ClassOnboarding from './class_onboarding';
import TeacherOnboarding from './teacher_onboarding';
import DownloadPanel from './download_panel';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        {/* Top section with left and right panels */}
        <div className="grid grid-cols-2 gap-6 mb-6">

                
          {/* Right panel - Teacher Onboarding */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Teacher Onboarding</h2>
            <TeacherOnboarding />
          </div>
          
          {/* Left panel - Class Onboarding */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Class Onboarding</h2>
            <ClassOnboarding />
          </div>
      
        </div>
        
        {/* Bottom section - Download Panel */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Download Panel</h2>
          <DownloadPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
