// frontend/src/dashboard/dashboard.jsx
import React, { useEffect, useState } from 'react';
import ClassOnboarding from './class_onboarding';
import TeacherOnboarding from './teacher_onboarding';
import DownloadPanel from './download_panel';
import Teacher from '../teacher/teacher';
import Classroom from '../classroom/classroom';

const Dashboard = ({ initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-lg font-semibold text-gray-900">Planora</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              className={`${activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-700`}
              href="/dashboard"
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); setActiveTab('dashboard'); }}
            >
              Dashboard
            </a>
            <a
              className={`${activeTab === 'teacher' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-700`}
              href="/teacher"
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/teacher'); window.dispatchEvent(new PopStateEvent('popstate')); setActiveTab('teacher'); }}
            >
              Teacher
            </a>
            <a
              className={`${activeTab === 'classroom' ? 'text-indigo-600 font-semibold' : 'text-gray-600'} hover:text-indigo-700`}
              href="/classroom"
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/classroom'); window.dispatchEvent(new PopStateEvent('popstate')); setActiveTab('classroom'); }}
            >
              Classroom
            </a>
          </div>
        </nav>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Onboarding</h2>
                  <TeacherOnboarding />
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Class Onboarding</h2>
                  <ClassOnboarding />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Panel</h2>
                <DownloadPanel />
              </div>
            </>
          )}

          {activeTab === 'teacher' && (
            <Teacher />
          )}

          {activeTab === 'classroom' && (
            <Classroom />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
