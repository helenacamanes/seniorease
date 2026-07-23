export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  courseId?: string;
  courseName?: string;
  completedAt?: string;
}

export interface TaskItem {
  category: string;
  title: string;
  steps?: string[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  tasks: TaskItem[];
}