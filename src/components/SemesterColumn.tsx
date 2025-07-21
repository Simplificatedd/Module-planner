import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { Course } from '../types';
import CourseItem from './CourseItem';
import { usePlannerStore } from '../store/plannerStore';
import { useNotificationStore } from '../store/notificationStore';

interface SemesterColumnProps {
  semesterIndex: number;
  courses: Course[];
}

const SemesterColumn: React.FC<SemesterColumnProps> = ({ semesterIndex, courses }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `semester-${semesterIndex}`,
  });

  const { getCourseDropSemester, deleteSemester, courses: allCourses, numSemesters } = usePlannerStore();
  const { addNotification } = useNotificationStore();

  // Group courses by unique ID to avoid duplicates
  const uniqueCourses = courses.reduce((acc, course) => {
    if (!acc.some(c => c.id === course.id)) {
      acc.push(course);
    }
    return acc;
  }, [] as Course[]);

  // Separate primary courses (where the course was dropped) from continued courses
  const primaryCourses = uniqueCourses.filter(course => {
    const dropSemester = getCourseDropSemester(course.id);
    return dropSemester === semesterIndex;
  });

  const continuedCourses = uniqueCourses.filter(course => {
    const dropSemester = getCourseDropSemester(course.id);
    return dropSemester !== -1 && dropSemester !== semesterIndex;
  });

  // Calculate credits only from primary courses (courses that start in this semester)
  const totalCredits = primaryCourses.reduce((sum, course) => sum + course.value, 0);

  // Check conditions for deletion
  const hasPrimaryCourses = primaryCourses.length > 0;
  const newNumSemesters = numSemesters - 1;
  const maxModuleSpan = Math.max(...allCourses.map(course => course.semesterSpan), 0);
  const wouldViolateSpanConstraint = maxModuleSpan > newNumSemesters;
  
  const canDelete = !hasPrimaryCourses && !wouldViolateSpanConstraint;

  const handleDeleteSemester = () => {
    if (canDelete) {
      deleteSemester(semesterIndex);
    } else {
      // Show notification explaining why deletion is not allowed
      if (hasPrimaryCourses) {
        addNotification({
          type: 'error',
          message: 'Cannot delete semester containing modules that start in it. Please remove all modules from the semester first.',
          duration: 5000
        });
      } else if (wouldViolateSpanConstraint) {
        addNotification({
          type: 'error',
          message: `Unable to delete semester that will result in less semesters than Module span. (min: ${maxModuleSpan})`,
          duration: 5000
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-lg semester-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Semester {semesterIndex + 1}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {totalCredits} credits
          </span>
          <button
            onClick={handleDeleteSemester}
            className="p-1.5 rounded transition-colors text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            title={`Delete Semester ${semesterIndex + 1}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[300px] p-3 rounded-md transition-colors ${
          isOver 
            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-500' 
            : 'bg-gray-50 dark:bg-gray-700'
        }`}
      >
        {/* Primary courses */}
        {primaryCourses.map((course) => (
          <CourseItem
            key={`primary-${course.id}`}
            course={course}
            fromSemester={semesterIndex}
            isDraggable={true}
          />
        ))}

        {/* Continued courses (shown as placeholders) */}
        {continuedCourses.map((course) => (
          <div
            key={`continued-${course.id}`}
            className="bg-gray-300 dark:bg-gray-600 p-3 rounded-md shadow-sm border border-gray-400 dark:border-gray-500 flex justify-between items-center opacity-75"
          >
            <span className="font-medium text-sm text-gray-600 dark:text-gray-300">
              {course.name} (continued)
            </span>
            <span className="font-bold text-sm text-gray-600 dark:text-gray-300">
              0 {/* Continued courses show 0 credits */}
            </span>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
            Drop courses here
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterColumn;
