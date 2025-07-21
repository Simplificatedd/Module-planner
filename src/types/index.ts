export interface Course {
  id: string;
  name: string;
  value: number;
  semesterSpan: number;
}

export interface SemesterData {
  [semesterIndex: string]: Course[];
}

export interface AppState {
  totalCreditsGoal: number;
  numSemesters: number;
  courses: Course[];
  semesters: SemesterData;
  showingAllModules: boolean;
}

export interface DragItem {
  id: string;
  type: 'course';
  course: Course;
  fromSemester?: number;
}
