export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  courseId?: string;
  courseName?: string;
  // 🌟 Preenchido quando a tarefa é concluída, usado no histórico simples de atividades
  completedAt?: string;
}
