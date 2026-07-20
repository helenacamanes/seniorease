export interface TaskProgressInput {
  completed: boolean;
}

export class CalculateProgress {
  /**
   * Calcula a porcentagem de tarefas concluídas, retornando um valor inteiro entre 0 e 100.
   * Se a lista estiver vazia, retorna 0.
   */
  static execute(tasks: TaskProgressInput[]): number {
    if (!tasks || tasks.length === 0) {
      return 0;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed === true).length;
    
    const percentage = (completedTasks / totalTasks) * 100;

    // Retorna arredondado para evitar números quebrados na interface do idoso
    return Math.round(percentage);
  }
}