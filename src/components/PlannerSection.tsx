import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import ProgressSection from './ProgressSection';
import CourseManagement from './CourseManagement';
import SemesterGrid from './SemesterGrid';

const PlannerSection: React.FC = () => {
  const {
    activeId,
    activeCourse,
    handleDragStart,
    handleDragEnd,
  } = useDragAndDrop();

  // Configure sensors for both desktop and mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a 5px movement before activating drag for desktop
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Reduced delay and tolerance for better mobile dragging across containers
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  );

  return (
    <div>
      <ProgressSection />
      
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CourseManagement isActive={!!activeId} />
          <SemesterGrid />
        </div>
        
        <DragOverlay 
          dropAnimation={null} 
          style={{ zIndex: 9999 }}
          adjustScale={false}
        >
          {activeId && activeCourse ? (
            <div className="course-unit bg-white dark:bg-gray-700 p-3 rounded-md shadow-xl border-2 border-indigo-300 dark:border-indigo-500 opacity-95 drag-overlay pointer-events-none">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {activeCourse.name}
                  {activeCourse.semesterSpan > 1 && ` (${activeCourse.semesterSpan} sem)`}
                </span>
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {activeCourse.value}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PlannerSection;
