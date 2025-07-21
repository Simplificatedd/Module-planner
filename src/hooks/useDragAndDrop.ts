import { useState } from 'react';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { usePlannerStore } from '../store/plannerStore';
import { Course } from '../types';

export const useDragAndDrop = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const { 
    courses, 
    moveCourseToSemester, 
    removeCourseFromSemester,
    removeCourse 
  } = usePlannerStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const course = courses.find(c => c.id === active.id);
    if (course) {
      setActiveCourse(course);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveCourse(null);

    if (!over) return;

    const courseId = active.id as string;
    const overId = over.id as string;
    const fromSemester = active.data.current?.fromSemester;

    // Handle dropping on trash
    if (overId === 'trash-zone') {
      removeCourse(courseId);
      return;
    }

    // Handle dropping on semester
    if (overId.startsWith('semester-')) {
      const semesterIndex = parseInt(overId.replace('semester-', ''));
      
      moveCourseToSemester(courseId, semesterIndex, fromSemester);
      return;
    }

    // Handle removing from semester (dropping on course bank)
    if (overId === 'course-bank') {
      if (fromSemester !== undefined) {
        removeCourseFromSemester(courseId, fromSemester);
      }
    }
  };

  return {
    activeId,
    activeCourse,
    handleDragStart,
    handleDragEnd,
  };
};
