import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Edit2 } from 'lucide-react';
import { Course } from '../types';
import CourseEditModal from './CourseEditModal';

interface CourseItemProps {
  course: Course;
  showEditButton?: boolean;
  isDraggable?: boolean;
  fromSemester?: number;
  isAssigned?: boolean;
}

const CourseItem: React.FC<CourseItemProps> = ({ 
  course, 
  showEditButton = false, 
  isDraggable = true,
  fromSemester,
  isAssigned
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  
  // Use different ID for non-draggable items to prevent drag state conflicts
  const draggableId = isDraggable ? course.id : `edit-${course.id}`;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    disabled: !isDraggable,
    data: {
      course,
      fromSemester,
    },
  });

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for feedback
    }
  };

  // Touch event handlers for better mobile interaction
  const handleTouchStart = () => {
    if (isDraggable) {
      setIsTouched(true);
      triggerHapticFeedback();
    }
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
  };

  // Enhanced listeners with touch events
  const enhancedListeners = isDraggable ? {
    ...listeners,
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart();
      listeners?.onTouchStart?.(e as any);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      handleTouchEnd();
      listeners?.onTouchEnd?.(e as any);
    },
  } : {};

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const semesterSpanText = course.semesterSpan > 1 ? ` (${course.semesterSpan} sem)` : '';

  // Determine assignment status tag
  const getAssignmentTag = () => {
    if (fromSemester !== undefined) {
      // Course is in a semester grid
      return '';
    }
    
    if (showEditButton && isAssigned !== undefined) {
      // Course is in edit mode (module bank) - show actual assignment status
      return isAssigned ? ' (assigned)' : ' (unassigned)';
    }
    
    // Default case - no tag
    return '';
  };

  return (
    <>
      <div className="relative group">
        <div
          ref={setNodeRef}
          style={{
            ...style,
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
          {...(isDraggable ? enhancedListeners : {})}
          {...(isDraggable ? attributes : {})}
          className={`course-unit bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 flex justify-between items-center relative transition-all duration-200 ${
            isDragging ? 'opacity-50 scale-105 rotate-1' : ''
          } ${
            isTouched ? 'scale-105 shadow-md' : ''
          } ${
            isDraggable ? 'cursor-grab active:cursor-grabbing touch-manipulation' : 'cursor-default'
          } ${
            showEditButton ? 'pr-10' : ''
          } ${
            isDraggable ? 'select-none' : ''
          }`}
        >
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 flex-1 pr-2">
            {course.name}{semesterSpanText}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{getAssignmentTag()}</span>
          </span>
          <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {course.value}
          </span>
        </div>
        
        {/* Edit button positioned absolutely to avoid drag interference */}
        {showEditButton && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Edit button clicked for course:', course.name);
              setIsEditModalOpen(true);
            }}
            className={`absolute top-1/2 right-1 -translate-y-1/2 z-20 p-1 rounded transition-all text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 ${
              isDraggable ? 'opacity-0 group-hover:opacity-100' : 'opacity-75 hover:opacity-100'
            }`}
            title="Edit course"
            type="button"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditModalOpen && (
        <CourseEditModal
          course={course}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default CourseItem;
