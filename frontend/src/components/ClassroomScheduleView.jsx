// frontend/src/components/ClassroomScheduleView.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ScheduleTable from './ScheduleTable';
import { TimetableAPI } from '../api/timetable';

const ClassroomScheduleView = ({
  classrooms,
  teachers,
  classSchedules,
  teacherSchedules = {},
  selectedClassroom,
  setSelectedClassroom,
  updateSchedule,
  getAvailableTeachers,
  getTeachersForSubject,
  getSubjectsForClass,
  isTeacherAvailable,
  autoGenerateSchedule,
}) => {
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];

  const getCurrentClassroom = () => {
    if (!selectedClassroom) return null;
    return classrooms.find(c => c.id === parseInt(selectedClassroom));
  };

  const getAvailableSubjects = () => {
    const classroom = getCurrentClassroom();
    if (!classroom) return [];
    return getSubjectsForClass(classroom.grade);
  };

  const getTeachersForTimeSlot = async (dayIndex, periodIndex, selectedSubject = null) => {
    if (!selectedClassroom) return [];
    if (getAvailableTeachers) {
      return getAvailableTeachers(
        parseInt(selectedClassroom),
        dayIndex,
        periodIndex,
        selectedSubject
      );
    }
    const { teachers: available } = await TimetableAPI.getAvailableTeachersForSlot({
      classroomId: parseInt(selectedClassroom),
      dayIndex,
      periodIndex,
      subject: selectedSubject || undefined,
    });
    return available;
  };
  const getTeachersForCurrentClassSubject = async (subject) => {
    const classroom = getCurrentClassroom();
    if (!classroom) return [];
    if (getTeachersForSubject) return getTeachersForSubject(classroom.grade, subject);
    // Fallback: filter all teachers by subject capability
    try {
      const { teachers: all } = await TimetableAPI.getTeachers();
      return all.filter(t => (t.subjects || []).includes(subject));
    } catch (e) {
      return [];
    }
  };
  const validateTeacherAssignment = async (dayIndex, periodIndex, teacherId, subject) => {
    if (!selectedClassroom || !teacherId) return true;
    
    const classroom = getCurrentClassroom();
    const teacher = teachers.find(t => t.id === parseInt(teacherId));
    
    if (!teacher || !classroom) return false;
    
    // Check if teacher can teach this subject
    if (subject && Array.isArray(teacher.subjects) && !teacher.subjects.includes(subject)) return false;
    
    // Check if teacher can teach this class (only if classes provided)
    if (Array.isArray(teacher.classes) && teacher.classes.length > 0) {
      if (!teacher.classes.includes(classroom.grade)) return false;
    }
    
    // Check if teacher is available at this time
    if (isTeacherAvailable) {
      return isTeacherAvailable(parseInt(teacherId), dayIndex, periodIndex, parseInt(selectedClassroom));
    }
    const { available } = await TimetableAPI.isTeacherAvailable({
      teacherId: parseInt(teacherId),
      dayIndex,
      periodIndex,
      subject,
      classroomId: parseInt(selectedClassroom),
    });
    return available;
  };

  // Enhanced update schedule with validation
  const handleUpdateSchedule = async (dayIndex, periodIndex, teacherId, subject) => {
    const classroom = getCurrentClassroom();
    
    if (!classroom) {
      console.error('No classroom selected');
      return false;
    }

    // Validate the assignment
    const valid = await validateTeacherAssignment(dayIndex, periodIndex, teacherId, subject);
    if (!valid) {
      console.warn('Invalid teacher assignment');
      return false;
    }

    // Check if subject is valid for this class
    const validSubjects = getSubjectsForClass(classroom.grade);
    if (subject && !validSubjects.includes(subject)) {
      console.warn(`Subject ${subject} is not valid for class ${classroom.grade}`);
      return false;
    }

    if (updateSchedule) {
      return updateSchedule(parseInt(selectedClassroom), dayIndex, periodIndex, teacherId, subject);
    }
    // Default: single-assignment path to backend slot update
    await TimetableAPI.updateSlot({
      classroomId: parseInt(selectedClassroom),
      dayIndex,
      periodIndex,
      assignments: teacherId ? [{ teacher_id: parseInt(teacherId), subject }] : [],
    });
    return true;
  };

  // Get classroom statistics
  const getClassroomStats = () => {
    const classroom = getCurrentClassroom();
    const key = selectedClassroom ? parseInt(selectedClassroom) : null;
    if (!classroom || key == null || !classSchedules[key]) return null;

    const schedule = classSchedules[key] || [];
    let totalSlots = 0;
    let filledSlots = 0;
    const subjectCount = {};
    const teacherCount = {};

    const getTeacherNameById = (id) => {
      const t = teachers.find(x => x.id === Number(id));
      return t ? (t.teachername || String(id)) : String(id);
    };

    schedule.forEach(day => {
      (day || []).forEach(cell => {
        totalSlots++;
        if (!cell) return; // empty slot
        // Backend stores an array of assignments per slot
        if (Array.isArray(cell)) {
          if (cell.length > 0) filledSlots++;
          cell.forEach(assign => {
            if (!assign) return;
            const subject = assign.subject || 'Unknown';
            const teacherId = assign.teacher_id != null ? assign.teacher_id : assign.teacherId;
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
            if (teacherId != null) {
              const name = getTeacherNameById(teacherId);
              teacherCount[name] = (teacherCount[name] || 0) + 1;
            }
          });
        } else if (typeof cell === 'object') {
          // Legacy single-assignment object
          const teacherId = cell.teacher_id != null ? cell.teacher_id : cell.teacherId;
          const subject = cell.subject || 'Unknown';
          if (teacherId != null || subject) {
            filledSlots++;
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
            if (teacherId != null) {
              const name = getTeacherNameById(teacherId);
              teacherCount[name] = (teacherCount[name] || 0) + 1;
            }
          }
        }
      });
    });

    return {
      totalSlots,
      filledSlots,
      completionPercentage: totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0,
      subjectCount,
      teacherCount
    };
  };

  const currentClassroom = getCurrentClassroom();
  const availableSubjects = getAvailableSubjects();
  const stats = getClassroomStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            // Updated focus ring color
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4f39f6]"
          >
            <option value="">Select Classroom</option>
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.grade})
              </option>
            ))}
          </select>
          
          {currentClassroom && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentClassroom.name}</span>
              <span className="mx-2">•</span>
              <span>Grade: {currentClassroom.grade}</span>
              <span className="mx-2">•</span>
              <span>Division: {currentClassroom.division}</span>
            </div>
          )}
        </div>

        {stats && (
          <div className="text-sm text-gray-600">
            Schedule Completion: 
            <span className={`ml-1 font-medium ${
              stats.completionPercentage >= 80 ? 'text-green-600' : 
              stats.completionPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.completionPercentage}%
            </span>
            <span className="ml-1">({stats.filledSlots}/{stats.totalSlots})</span>
          </div>
        )}
      </div>

      {selectedClassroom && classSchedules[selectedClassroom] && (
        <div className="space-y-4">
          {/* Class Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subjects Info */}
            <div className="bg-[#4f39f6] bg-opacity-10 border border-[#4f39f6] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#4f39f6] mb-2">
                Subjects for {currentClassroom?.grade}
              </h3>
              <div className="flex flex-wrap gap-1">
                {availableSubjects.map(subject => (
                  <span 
                    key={subject}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4f39f6] text-white"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Teachers Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Available Teachers
              </h3>
              <div className="text-xs text-gray-600">
                {teachers.filter(t => Array.isArray(t.classes) ? t.classes.includes(currentClassroom?.grade) : true).length} teachers 
                can teach this class
              </div>
              {stats && Object.keys(stats.teacherCount).length > 0 && (
                <div className="mt-2 text-xs text-gray-700">
                  Currently assigned: {Object.keys(stats.teacherCount).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Schedule Instructions */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Scheduling Rules</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Only teachers qualified for this class and subject are shown</li>
              <li>• Teachers cannot be assigned to multiple classes at the same time</li>
              <li>• Subjects are limited to the curriculum for {currentClassroom?.grade}</li>
            </ul>
          </div>

          <ScheduleTable
            scheduleData={classSchedules[selectedClassroom]}
            days={days}
            periods={periods}
            teachers={teachers}
            subjects={availableSubjects} // Pass class-specific subjects
            onUpdateSchedule={handleUpdateSchedule}
            onAddAssignment={async (dayIndex, periodIndex, assignment) => {
              const classroomId = parseInt(selectedClassroom);
              await TimetableAPI.addAssignment({ classroomId, dayIndex, periodIndex, assignment });
              // minimal refresh: trigger parent update or rely on page reload
            }}
            onRemoveAssignment={async (dayIndex, periodIndex, teacherId, subject) => {
              const classroomId = parseInt(selectedClassroom);
              await TimetableAPI.removeAssignment({ classroomId, dayIndex, periodIndex, teacherId, subject });
              // minimal refresh
            }}
            getTeachersForTimeSlot={getTeachersForTimeSlot}
            getTeachersForSubject={getTeachersForCurrentClassSubject}
            validateAssignment={validateTeacherAssignment}
            type="classroom"
            classroom={currentClassroom}
            teacherSchedules={teacherSchedules}
          />

          {/* Schedule Statistics */}
          {stats && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Schedule Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Distribution */}
                {Object.keys(stats.subjectCount).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Subject Distribution</h4>
                    <div className="space-y-1">
                      {Object.entries(stats.subjectCount).map(([subject, count]) => (
                        <div key={subject} className="flex justify-between text-xs">
                          <span className="text-gray-600">{subject}</span>
                          <span className="font-medium">{count} periods</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher Workload */}
                {Object.keys(stats.teacherCount).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Teacher Workload</h4>
                    <div className="space-y-1">
                      {Object.entries(stats.teacherCount).map(([teacher, count]) => (
                        <div key={teacher} className="flex justify-between text-xs">
                          <span className="text-gray-600">{teacher}</span>
                          <span className="font-medium">{count} periods</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedClassroom && !classSchedules[selectedClassroom] && (
        <div className="text-center py-8 text-gray-500">
          <p>No schedule data found for this classroom.</p>
        </div>
      )}

      {!selectedClassroom && (
        <div className="text-center py-12 text-gray-500">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">Select a Classroom</h3>
            <p className="text-sm">
              Choose a classroom from the dropdown above to view and edit its schedule.
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Each classroom has specific subjects and qualified teachers based on the grade level.
            </p>
          </div>
        </div>
      )}

      {selectedClassroom && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isAutoLoading}
            onClick={async () => {
              try {
                setIsAutoLoading(true);
                if (autoGenerateSchedule) {
                  await autoGenerateSchedule(parseInt(selectedClassroom));
                } else {
                  await TimetableAPI.autoGenerate(parseInt(selectedClassroom));
                }
              } finally {
                setIsAutoLoading(false);
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow ${
              isAutoLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAutoLoading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Auto Schedule'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

ClassroomScheduleView.propTypes = {
  classrooms: PropTypes.array.isRequired,
  teachers: PropTypes.array.isRequired,
  classSchedules: PropTypes.object.isRequired,
  selectedClassroom: PropTypes.string.isRequired,
  setSelectedClassroom: PropTypes.func.isRequired,
  updateSchedule: PropTypes.func.isRequired,
  getAvailableTeachers: PropTypes.func.isRequired,
  getTeachersForSubject: PropTypes.func.isRequired,
  getSubjectsForClass: PropTypes.func.isRequired,
  isTeacherAvailable: PropTypes.func.isRequired,
  autoGenerateSchedule: PropTypes.func,
};

export default ClassroomScheduleView;


