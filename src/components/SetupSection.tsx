import React, { useState } from 'react';
import { usePlannerStore } from '../store/plannerStore';

const SetupSection: React.FC = () => {
  const {
    totalCreditsGoal,
    numSemesters,
    setTotalCreditsGoal,
    setNumSemesters,
    startPlanning,
  } = usePlannerStore();

  const [localCredits, setLocalCredits] = useState(totalCreditsGoal);
  const [localSemesters, setLocalSemesters] = useState(numSemesters);

  // Check if inputs are valid
  const isFormValid = localCredits > 0 && localSemesters > 0;

  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '') {
      setLocalCredits(0);
    } else {
      const numValue = Number(value);
      // Restrict to maximum 3 digits (999)
      if (numValue <= 999) {
        setLocalCredits(numValue);
      }
    }
  };

  const handleSemestersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '') {
      setLocalSemesters(0);
    } else {
      const numValue = Number(value);
      // Restrict to maximum 2 digits (99)
      if (numValue <= 99) {
        setLocalSemesters(numValue);
      }
    }
  };

  const handleStartPlanning = () => {
    if (isFormValid) {
      setTotalCreditsGoal(localCredits);
      setNumSemesters(localSemesters);
      startPlanning();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">Initial Setup</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="total-credits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Credits to Clear
          </label>
          <input
            type="number"
            id="total-credits"
            value={localCredits === 0 ? '' : localCredits}
            onChange={handleCreditsChange}
            step="0.5"
            min="0"
            max="999"
            placeholder="Enter total credits"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="num-semesters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of Semesters
          </label>
          <input
            type="number"
            id="num-semesters"
            value={localSemesters === 0 ? '' : localSemesters}
            onChange={handleSemestersChange}
            min="1"
            max="99"
            placeholder="Enter number of semesters"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        onClick={handleStartPlanning}
        disabled={!isFormValid}
        className={`mt-6 w-full py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors ${
          isFormValid
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 cursor-pointer'
            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
      >
        Start Planning
      </button>
    </div>
  );
};

export default SetupSection;
