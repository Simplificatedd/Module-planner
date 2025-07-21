import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, SemesterData } from '../types';

interface PlannerState {
  // State
  totalCreditsGoal: number;
  numSemesters: number;
  courses: Course[];
  semesters: SemesterData;
  showingAllModules: boolean;
  isSetupComplete: boolean;
  courseDropSemesters: Record<string, number>; // Track where each course was actually dropped

  // Actions
  setTotalCreditsGoal: (credits: number) => void;
  setNumSemesters: (semesters: number) => void;
  addSemester: () => void;
  deleteSemester: (semesterIndex: number) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  removeCourse: (courseId: string) => void;
  moveCourseToSemester: (courseId: string, semesterIndex: number, fromSemester?: number) => void;
  removeCourseFromSemester: (courseId: string, semesterIndex: number) => void;
  toggleModuleView: () => void;
  startPlanning: () => void;
  resetPlan: () => void;
  backToSetup: () => void;
  clearUnassignedModules: () => void;
  clearAllModules: () => void;
  clearSemesters: () => void;
  
  // Computed
  getTotalAssignedCredits: () => number;
  getAvailableCourses: () => Course[];
  getProgressPercentage: () => number;
  getCourseStartingSemester: (courseId: string) => number;
  getCourseDropSemester: (courseId: string) => number;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      // Initial State
      totalCreditsGoal: 200,
      numSemesters: 8,
      courses: [],
      semesters: {},
      showingAllModules: false,
      isSetupComplete: false,
      courseDropSemesters: {},

      // Actions
      setTotalCreditsGoal: (credits) => set({ totalCreditsGoal: credits }),
      
      setNumSemesters: (numSemesters) => {
        const state = get();
        const newSemesters: SemesterData = {};
        
        // Preserve existing semester data up to the new number
        for (let i = 0; i < numSemesters; i++) {
          newSemesters[i] = state.semesters[i] || [];
        }
        
        set({ numSemesters, semesters: newSemesters });
      },

      addSemester: () => set((state) => {
        const newSemesterIndex = state.numSemesters;
        const newSemesters = { ...state.semesters, [newSemesterIndex]: [] };
        return { numSemesters: newSemesterIndex + 1, semesters: newSemesters };
      }),

      deleteSemester: (semesterIndex) => set((state) => {
        const semesterCourses = state.semesters[semesterIndex] || [];
        
        // Check if there are primary courses (courses that start in this semester)
        const primaryCourses = semesterCourses.filter(course => {
          const dropSemester = state.courseDropSemesters[course.id];
          return dropSemester === semesterIndex;
        });
        
        // Don't allow deletion if there are primary courses
        if (primaryCourses.length > 0) {
          return state;
        }
        
        // Step 1: Create new semester structure without the deleted semester
        const newSemesters: SemesterData = {};
        const newCourseDropSemesters = { ...state.courseDropSemesters };
        
        // Rebuild semesters, skipping the deleted one and updating indices
        let newIndex = 0;
        for (let originalIndex = 0; originalIndex < state.numSemesters; originalIndex++) {
          if (originalIndex === semesterIndex) {
            // Skip the deleted semester entirely
            continue;
          }
          
          // Copy courses from this semester (we'll rebuild multi-semester spans later)
          newSemesters[newIndex] = [...(state.semesters[originalIndex] || [])];
          
          // Update course drop tracking for courses that moved due to reindexing
          (state.semesters[originalIndex] || []).forEach(course => {
            if (newCourseDropSemesters[course.id] !== undefined) {
              const originalDropSemester = newCourseDropSemesters[course.id];
              // If the original drop semester was after the deleted semester, shift it down by 1
              if (originalDropSemester > semesterIndex) {
                newCourseDropSemesters[course.id] = originalDropSemester - 1;
              }
            }
          });
          
          newIndex++;
        }
        
        // Step 2: Re-check and redistribute all multi-semester courses
        // Clear all semester assignments first, we'll rebuild them properly
        const clearedSemesters: SemesterData = {};
        for (let i = 0; i < state.numSemesters - 1; i++) {
          clearedSemesters[i] = [];
        }
        
        // Get all unique courses that have drop semesters tracked
        const coursesToRedistribute = new Set<string>();
        Object.keys(newCourseDropSemesters).forEach(courseId => {
          const dropSemester = newCourseDropSemesters[courseId];
          if (dropSemester !== -1 && dropSemester < state.numSemesters - 1) {
            coursesToRedistribute.add(courseId);
          }
        });
        
        // Redistribute each course properly
        coursesToRedistribute.forEach(courseId => {
          const course = state.courses.find(c => c.id === courseId);
          const dropSemester = newCourseDropSemesters[courseId];
          
          if (course && dropSemester !== undefined && dropSemester >= 0) {
            // Place the primary course
            clearedSemesters[dropSemester] = [...(clearedSemesters[dropSemester] || []), course];
            
            // Handle multi-semester span
            if (course.semesterSpan > 1) {
              const remainingSpan = course.semesterSpan - 1;
              let forwardSemesters = 0;
              let backwardSemesters = 0;
              
              // Calculate how many semesters we can extend forward
              const maxForwardSemesters = (state.numSemesters - 1) - 1 - dropSemester;
              forwardSemesters = Math.min(remainingSpan, maxForwardSemesters);
              
              // If we can't fit all remaining semesters forward, fill backward
              backwardSemesters = remainingSpan - forwardSemesters;
              
              // Add to forward semesters
              for (let i = 1; i <= forwardSemesters; i++) {
                const nextSemIndex = dropSemester + i;
                if (nextSemIndex < state.numSemesters - 1) {
                  clearedSemesters[nextSemIndex] = [...(clearedSemesters[nextSemIndex] || []), course];
                }
              }
              
              // Add to backward semesters if needed
              for (let i = 1; i <= backwardSemesters; i++) {
                const prevSemIndex = dropSemester - i;
                if (prevSemIndex >= 0) {
                  clearedSemesters[prevSemIndex] = [...(clearedSemesters[prevSemIndex] || []), course];
                }
              }
            }
          }
        });
        
        return { 
          numSemesters: state.numSemesters - 1, 
          semesters: clearedSemesters,
          courseDropSemesters: newCourseDropSemesters
        };
      }),

      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),

      updateCourse: (courseId, updates) => set((state) => ({
        courses: state.courses.map(course =>
          course.id === courseId ? { ...course, ...updates } : course
        ),
        semesters: Object.fromEntries(
          Object.entries(state.semesters).map(([semIndex, courses]) => [
            semIndex,
            courses.map(course =>
              course.id === courseId ? { ...course, ...updates } : course
            )
          ])
        )
      })),

      removeCourse: (courseId) => set((state) => ({
        courses: state.courses.filter(course => course.id !== courseId),
        semesters: Object.fromEntries(
          Object.entries(state.semesters).map(([semIndex, courses]) => [
            semIndex,
            courses.filter(course => course.id !== courseId)
          ])
        ),
        courseDropSemesters: Object.fromEntries(
          Object.entries(state.courseDropSemesters).filter(([id]) => id !== courseId)
        )
      })),

      moveCourseToSemester: (courseId, semesterIndex, _fromSemester) => set((state) => {
        const course = state.courses.find(c => c.id === courseId);
        if (!course) return state;

        const newSemesters = { ...state.semesters };
        const newCourseDropSemesters = { ...state.courseDropSemesters };
        
        // Always remove from ALL previous semesters when moving a course
        // This ensures we don't have duplicates regardless of "Show All" state
        for (let i = 0; i < state.numSemesters; i++) {
          if (newSemesters[i]) {
            newSemesters[i] = newSemesters[i].filter(c => c.id !== courseId);
          }
        }

        // Track where this course was actually dropped
        newCourseDropSemesters[courseId] = semesterIndex;

        // Add to new semester (this becomes the drop semester)
        if (!newSemesters[semesterIndex]) {
          newSemesters[semesterIndex] = [];
        }
        
        // Check if course already exists in target semester (shouldn't happen after cleanup above)
        const existsInTarget = newSemesters[semesterIndex].some(c => c.id === courseId);
        if (!existsInTarget) {
          newSemesters[semesterIndex] = [...newSemesters[semesterIndex], course];
        }

        // Handle multi-semester courses with backward filling when needed
        if (course.semesterSpan > 1) {
          const remainingSpan = course.semesterSpan - 1; // -1 because we already placed the primary course
          let forwardSemesters = 0;
          let backwardSemesters = 0;
          
          // Calculate how many semesters we can extend forward
          const maxForwardSemesters = state.numSemesters - 1 - semesterIndex;
          forwardSemesters = Math.min(remainingSpan, maxForwardSemesters);
          
          // If we can't fit all remaining semesters forward, fill backward
          backwardSemesters = remainingSpan - forwardSemesters;
          
          // Add to forward semesters
          for (let i = 1; i <= forwardSemesters; i++) {
            const nextSemIndex = semesterIndex + i;
            if (!newSemesters[nextSemIndex]) {
              newSemesters[nextSemIndex] = [];
            }
            const existsInNext = newSemesters[nextSemIndex].some(c => c.id === courseId);
            if (!existsInNext) {
              newSemesters[nextSemIndex] = [...newSemesters[nextSemIndex], course];
            }
          }
          
          // Add to backward semesters if needed
          for (let i = 1; i <= backwardSemesters; i++) {
            const prevSemIndex = semesterIndex - i;
            if (prevSemIndex >= 0) {
              if (!newSemesters[prevSemIndex]) {
                newSemesters[prevSemIndex] = [];
              }
              const existsInPrev = newSemesters[prevSemIndex].some(c => c.id === courseId);
              if (!existsInPrev) {
                newSemesters[prevSemIndex] = [...newSemesters[prevSemIndex], course];
              }
            }
          }
        }

        return { semesters: newSemesters, courseDropSemesters: newCourseDropSemesters };
      }),

      removeCourseFromSemester: (courseId, _semesterIndex) => set((state) => {
        const course = state.courses.find(c => c.id === courseId);
        if (!course) return state;

        const newSemesters = { ...state.semesters };
        const newCourseDropSemesters = { ...state.courseDropSemesters };
        
        // Find the starting semester of this course
        let startingSemester = -1;
        for (let i = 0; i < state.numSemesters; i++) {
          if (newSemesters[i]?.some(c => c.id === courseId)) {
            startingSemester = i;
            break;
          }
        }

        // Remove from all semesters where this course appears
        if (startingSemester !== -1) {
          for (let i = 0; i < course.semesterSpan; i++) {
            const semIndex = startingSemester + i;
            if (newSemesters[semIndex]) {
              newSemesters[semIndex] = newSemesters[semIndex].filter(c => c.id !== courseId);
            }
          }
        }

        // Remove drop semester tracking
        delete newCourseDropSemesters[courseId];

        return { semesters: newSemesters, courseDropSemesters: newCourseDropSemesters };
      }),

      toggleModuleView: () => set((state) => ({
        showingAllModules: !state.showingAllModules
      })),

      startPlanning: () => set({ isSetupComplete: true }),

      resetPlan: () => set({
        totalCreditsGoal: 200,
        numSemesters: 8,
        courses: [],
        semesters: {},
        showingAllModules: false,
        isSetupComplete: false,
        courseDropSemesters: {},
      }),

      backToSetup: () => set({
        isSetupComplete: false,
        showingAllModules: false,
      }),

      clearUnassignedModules: () => set((state) => {
        // Get assigned course IDs
        const assignedCourses = new Set<string>();
        Object.values(state.semesters).forEach(courses => {
          courses.forEach(course => assignedCourses.add(course.id));
        });

        // Keep only assigned courses
        const assignedCoursesList = state.courses.filter(course => assignedCourses.has(course.id));
        
        return { courses: assignedCoursesList };
      }),

      clearAllModules: () => set({
        courses: [],
        semesters: {},
        courseDropSemesters: {},
        showingAllModules: false,
      }),

      clearSemesters: () => set({
        semesters: {},
        courseDropSemesters: {},
        showingAllModules: false,
      }),

      // Computed values
      getTotalAssignedCredits: () => {
        const state = get();
        const assignedCourses = new Set<string>();
        
        Object.values(state.semesters).forEach(courses => {
          courses.forEach(course => assignedCourses.add(course.id));
        });

        return Array.from(assignedCourses)
          .reduce((total, courseId) => {
            const course = state.courses.find(c => c.id === courseId);
            return total + (course?.value || 0);
          }, 0);
      },

      getAvailableCourses: () => {
        const state = get();
        if (state.showingAllModules) {
          return state.courses;
        }

        const assignedCourses = new Set<string>();
        Object.values(state.semesters).forEach(courses => {
          courses.forEach(course => assignedCourses.add(course.id));
        });

        return state.courses.filter(course => !assignedCourses.has(course.id));
      },

      getProgressPercentage: () => {
        const state = get();
        const totalAssigned = state.getTotalAssignedCredits();
        return Math.min(100, (totalAssigned / state.totalCreditsGoal) * 100);
      },

      getCourseStartingSemester: (courseId) => {
        const state = get();
        let earliestSemester = -1;
        
        // Find the earliest semester where this course appears
        for (let i = 0; i < state.numSemesters; i++) {
          if (state.semesters[i]?.some(c => c.id === courseId)) {
            earliestSemester = i;
            break;
          }
        }
        
        return earliestSemester;
      },

      getCourseDropSemester: (courseId) => {
        const state = get();
        return state.courseDropSemesters[courseId] ?? -1;
      },
    }),
    {
      name: 'semester-planner-storage',
    }
  )
);
