import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Course } from '../types';
import { usePlannerStore } from '../store/plannerStore';
import { useNotificationStore } from '../store/notificationStore';

interface CourseEditModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

const CourseEditModal: React.FC<CourseEditModalProps> = ({ course, isOpen, onClose }) => {
  const [name, setName] = useState(course.name);
  const [value, setValue] = useState(course.value.toString());
  const [semesterSpan, setSemesterSpan] = useState(course.semesterSpan);

  const { updateCourse, numSemesters } = usePlannerStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    setName(course.name);
    setValue(course.value.toString());
    setSemesterSpan(course.semesterSpan);
  }, [course]);

  const handleSave = () => {
    if (!name.trim() || !value.trim()) {
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

    updateCourse(course.id, {
      name: name.trim(),
      value: parseFloat(value),
      semesterSpan: semesterSpan,
    });

    addNotification({
      type: 'success',
      message: 'Course updated successfully',
      duration: 3000
    });

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Course</h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Credits
            </label>
            <input
              type="number"
              id="edit-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              step="0.5"
              min="0"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="edit-span" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Semester Span
            </label>
            <input
              type="number"
              id="edit-span"
              value={semesterSpan}
              onChange={(e) => setSemesterSpan(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              min="1"
              max={numSemesters}
              className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
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
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !value.trim() || semesterSpan > numSemesters || semesterSpan < 1}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-700 border border-transparent rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEditModal;
