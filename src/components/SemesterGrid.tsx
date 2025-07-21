import React from 'react';
import { Plus } from 'lucide-react';
import { usePlannerStore } from '../store/plannerStore';
import SemesterColumn from './SemesterColumn';

const SemesterGrid: React.FC = () => {
  const { numSemesters, semesters, addSemester } = usePlannerStore();

  return (
    <div className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: numSemesters }, (_, index) => (
          <SemesterColumn
            key={index}
            semesterIndex={index}
            courses={semesters[index] || []}
          />
        ))}
        {/* Add Semester Button */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-lg semester-container">
          {/* Header to match semester column header structure */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-400 dark:text-gray-500">
              New Semester
            </h3>
          </div>
          
          <div className="min-h-[300px] p-3 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
            <button
              onClick={addSemester}
              className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Add Semester</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterGrid;
