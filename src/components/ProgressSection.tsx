import React from 'react';
import { usePlannerStore } from '../store/plannerStore';

const ProgressSection: React.FC = () => {
  const totalCreditsGoal = usePlannerStore((state) => state.totalCreditsGoal);
  const getTotalAssignedCredits = usePlannerStore((state) => state.getTotalAssignedCredits);
  const getProgressPercentage = usePlannerStore((state) => state.getProgressPercentage);
  const resetPlan = usePlannerStore((state) => state.resetPlan);
  const clearUnassignedModules = usePlannerStore((state) => state.clearUnassignedModules);
  const clearAllModules = usePlannerStore((state) => state.clearAllModules);
  const clearSemesters = usePlannerStore((state) => state.clearSemesters);

  const handleClearAllModules = () => {
    if (window.confirm('Are you sure you want to clear ALL modules? This action cannot be undone and will remove all modules from your module bank and semesters.')) {
      clearAllModules();
    }
  };

  const totalAssigned = getTotalAssignedCredits();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-lg mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overall Progress</h3>
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
          {totalAssigned} / {totalCreditsGoal} Credits
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-3">
        <div 
          className="h-4 rounded-full progress-bar-fill transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={resetPlan}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
          title="Reset the entire planner and return to setup page"
        >
          Back to Setup
        </button>
        <span className="text-base text-gray-500 dark:text-gray-400"><strong>Clear:</strong></span>
        <button
          onClick={handleClearAllModules}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
          title="Remove all modules from both module bank and semesters (cannot be undone)"
        >
          ALL Modules
        </button>
        <button
          onClick={clearUnassignedModules}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
          title="Remove only modules that haven't been assigned to any semester"
        >
          Unassigned Modules
        </button>
        <button
          onClick={clearSemesters}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
          title="Move all modules from semesters back to module bank"
        >
          Semesters
        </button>
      </div>
    </div>
  );
};

export default ProgressSection;
