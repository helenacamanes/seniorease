export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  courseId?: string;
  courseName?: string;
}

export * from './use-cases/AuthValidator';
export * from './accessibility/preferences';
export * from './use-cases/UserDataInitializer';
export * from './use-cases/CalculateProgress';