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

  const handleDownloadSemesterGrid = () => {
    // Get semester data from the store
    const { numSemesters, semesters, getCourseDropSemester } = usePlannerStore.getState();
    
    // Calculate total assigned credits
    const totalAssignedCredits = getTotalAssignedCredits();
    const totalGoalCredits = totalCreditsGoal;
    
    // Process semester data
    let semesterContent = '';
    
    for (let i = 0; i < numSemesters; i++) {
      const semesterCourses = semesters[i] || [];
      
      // Get all courses in this semester (both primary and continued)
      const allCourses = semesterCourses.map(course => {
        const dropSemester = getCourseDropSemester(course.id);
        const isPrimary = dropSemester === i;
        return {
          ...course,
          isPrimary,
          displayCredits: isPrimary ? course.value : 0 // Only primary courses count toward credits
        };
      });
      
      // Calculate total credits for this semester (only from primary courses)
      const totalCredits = allCourses
        .filter(course => course.isPrimary)
        .reduce((sum, course) => sum + course.value, 0);
      
      // Build semester section
      semesterContent += `
        <div class="semester-section">
          <div class="semester-header">
            <h2>Semester ${i + 1}</h2>
            <div class="total-credits">${totalCredits} Credits</div>
          </div>
          <div class="modules-list">
      `;
      
      if (allCourses.length === 0) {
        semesterContent += '<div class="no-modules">No modules assigned</div>';
      } else {
        allCourses.forEach(course => {
          const courseLabel = course.isPrimary ? course.name : `${course.name} (continued)`;
          const creditsLabel = course.isPrimary ? `${course.value} credits` : 'continued';
          
          semesterContent += `
            <div class="module-item ${course.isPrimary ? '' : 'continued-course'}">
              <span class="module-name">${courseLabel}</span>
              <span class="module-credits">${creditsLabel}</span>
            </div>
          `;
        });
      }
      
      semesterContent += `
          </div>
        </div>
      `;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the semester grid');
      return;
    }

    // Create clean, minimal HTML for PDF
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Semester Plan</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              background: white;
              padding: 30px;
              line-height: 1.4;
            }
            
            .document-header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            
            .document-header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #000;
              margin-bottom: 10px;
            }
            
            .document-header p {
              color: #666;
              font-size: 16px;
              margin-bottom: 15px;
            }
            
            .total-summary {
              font-size: 18px;
              color: #4f46e5;
              font-weight: bold;
            }
            
            .semester-section {
              margin-bottom: 30px;
              break-inside: avoid;
            }
            
            .semester-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding: 10px 0;
              border-bottom: 1px solid #ddd;
            }
            
            .semester-header h2 {
              font-size: 20px;
              font-weight: bold;
              color: #000;
            }
            
            .total-credits {
              font-size: 16px;
              font-weight: bold;
              color: #000000;
            }
            
            .modules-list {
              margin-left: 20px;
            }
            
            .module-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            
            .module-item:last-child {
              border-bottom: none;
            }
            
            .module-item.continued-course {
              opacity: 0.7;
              font-style: italic;
            }
            
            .module-name {
              font-weight: 500;
              color: #333;
            }
            
            .module-credits {
              font-weight: bold;
              color: #4f46e5;
            }
            
            .continued-course .module-credits {
              color: #999;
              font-weight: normal;
            }
            
            .no-modules {
              color: #999;
              font-style: italic;
              padding: 10px 0;
            }
            
            @media print {
              body { 
                padding: 20px; 
              }
              .semester-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <h1>Semester Plan</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <div class="total-summary">
              <strong>${totalAssignedCredits} / ${totalGoalCredits} Credits</strong>
            </div>
          </div>
          ${semesterContent}
        </body>
      </html>
    `;

    // Write content and setup print
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Don't automatically close the window - let user close it manually
        // This way if they cancel the print dialog, the preview stays open
      }, 250);
    };
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <button
          onClick={handleDownloadSemesterGrid}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 dark:bg-indigo-700 text-white text-sm font-medium rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          title="Download planner data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
};

export default ProgressSection;
