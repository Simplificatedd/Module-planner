import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
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

  return (
    <div>
      <ProgressSection />
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CourseManagement isActive={!!activeId} />
          <SemesterGrid />
        </div>
        
        <DragOverlay>
          {activeId && activeCourse ? (
            <div className="course-unit bg-white p-3 rounded-md shadow-lg border border-gray-200 opacity-90 drag-overlay">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                  {activeCourse.name}
                  {activeCourse.semesterSpan > 1 && ` (${activeCourse.semesterSpan} sem)`}
                </span>
                <span className="font-bold text-sm text-indigo-600">
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
