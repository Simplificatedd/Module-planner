import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';

interface TrashZoneProps {
  isActive?: boolean; // Whether something is being dragged
}

const TrashZone: React.FC<TrashZoneProps> = ({ isActive = false }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'trash-zone',
  });

  const getClassNames = () => {
    const baseClasses = "mt-4 text-center border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out select-none";
    
    if (isOver) {
      // When hovering over with a draggable item
      return `${baseClasses} p-8 border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 transform scale-105 shadow-xl pulse`;
    }
    
    if (isActive) {
      // When something is being dragged (but not over trash)
      return `${baseClasses} p-6 border-red-400 dark:border-red-500 bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-md md:p-6 p-4`;
    }
    
    // Default state
    return `${baseClasses} p-4 border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 md:p-4 p-3`;
  };

  return (
    <div
      ref={setNodeRef}
      className={getClassNames()}
    >
      <div className="flex items-center justify-center gap-2">
        <Trash2 className={`transition-all duration-300 ${
          isOver ? 'w-7 h-7' : isActive ? 'w-6 h-6' : 'w-5 h-5'
        }`} />
        <span className={`font-medium transition-all duration-300 ${
          isOver ? 'text-lg' : isActive ? 'text-base' : 'text-sm'
        }`}>
          {isOver ? 'Release to delete course' : (
            <>
              <span className="hidden md:inline">Drag here to delete course</span>
              <span className="md:hidden">Touch & drag to delete</span>
            </>
          )}
        </span>
      </div>
      {isOver && (
        <div className="mt-2 text-sm opacity-75 animate-pulse">
          ⚠️ This action cannot be undone
        </div>
      )}
    </div>
  );
};

export default TrashZone;
