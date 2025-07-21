import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { usePlannerStore } from '../store/plannerStore';
import { useNotificationStore } from '../store/notificationStore';
import { Course } from '../types';
import CourseItem from './CourseItem';
import TrashZone from './TrashZone';

interface CourseManagementProps {
  isActive?: boolean;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ isActive = false }) => {
  const [courseName, setCourseName] = useState('');
  const [courseValue, setCourseValue] = useState('');
  const [semesterSpan, setSemesterSpan] = useState(1);

  const {
    addCourse,
    getAvailableCourses,
    showingAllModules,
    toggleModuleView,
    numSemesters,
    courses, // Get all courses for stable edit mode display
    isCourseAssigned,
  } = usePlannerStore();
  const { addNotification } = useNotificationStore();

  // For edit mode, use a stable sorted list of all courses
  // For normal mode, use only available courses
  const displayCourses = showingAllModules 
    ? [...courses].sort((a, b) => a.name.localeCompare(b.name)) // Stable alphabetical sort
    : getAvailableCourses();

  const { setNodeRef } = useDroppable({
    id: 'course-bank',
  });

  const handleAddCourse = () => {
    if (!courseName.trim() || !courseValue.trim()) {
      addNotification({
        type: 'error',
        message: 'Please fill in all required fields',
        duration: 3000
      });
      return;
    }

    // Validate semester span
    if (semesterSpan > numSemesters) {
      addNotification({
        type: 'error',
        message: `Semester span (${semesterSpan}) cannot exceed the total number of semesters (${numSemesters})`,
        duration: 5000
      });
      return;
    }

    if (semesterSpan < 1) {
      addNotification({
        type: 'error',
        message: 'Semester span must be at least 1',
        duration: 3000
      });
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: courseName.trim(),
      value: parseFloat(courseValue),
      semesterSpan: semesterSpan,
    };

    addCourse(newCourse);
    setCourseName('');
    setCourseValue('');
    setSemesterSpan(1);

    addNotification({
      type: 'success',
      message: 'Course added successfully',
      duration: 3000
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCourse();
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Add Course Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Course</h2>
        <div className="space-y-3 mb-6">
          <div>
            <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Name or Code
            </label>
            <input
              type="text"
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. CS101"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="course-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Credits
            </label>
            <input
              type="number"
              id="course-value"
              value={courseValue}
              onChange={(e) => setCourseValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. 5 or 2.5"
              step="0.5"
              min="0"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="semester-span" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of semesters
            </label>
            <input
              type="number"
              id="semester-span"
              value={semesterSpan}
              onChange={(e) => setSemesterSpan(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              min="1"
              max={numSemesters}
              className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                semesterSpan > numSemesters || semesterSpan < 1
                  ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {(semesterSpan > numSemesters || semesterSpan < 1) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {semesterSpan > numSemesters 
                  ? `Cannot exceed ${numSemesters} semesters`
                  : 'Must be at least 1 semester'
                }
              </p>
            )}
          </div>
          <button
            onClick={handleAddCourse}
            disabled={!courseName.trim() || !courseValue.trim() || semesterSpan > numSemesters || semesterSpan < 1}
            className="w-full bg-indigo-500 dark:bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-600 dark:hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold"
          >
            Add Module
          </button>
        </div>
      </div>

      {/* Course Bank */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Module Bank
            </h3>
            <p className={`text-xs h-4 ${showingAllModules ? 'text-gray-500 dark:text-gray-400' : 'text-transparent'}`}>
              (Edit Mode)
            </p>
          </div>
          <button
            onClick={toggleModuleView}
            className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
            title="Toggle between showing only available modules or all modules for editing"
          >
            {showingAllModules ? 'Show Available' : 'Show All / Edit'}
          </button>
        </div>
        
        <div
          ref={setNodeRef}
          className={`space-y-2 p-4 rounded-md h-[300px] overflow-y-auto ${
            showingAllModules 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
        >
          {displayCourses.map((course) => {
            const isAssigned = isCourseAssigned(course.id);
            return (
              <CourseItem
                key={course.id}
                course={course}
                showEditButton={showingAllModules}
                isDraggable={!showingAllModules} // No dragging allowed in "Show All" mode at all
                fromSemester={undefined} // Course bank items don't have a source semester
                isAssigned={isAssigned}
              />
            );
          })}
          {displayCourses.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {showingAllModules ? 'No courses added yet' : 'All courses have been assigned'}
            </div>
          )}
        </div>
        
        <TrashZone isActive={isActive} />
      </div>
    </div>
  );
};

export default CourseManagement;
