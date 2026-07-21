import { Task } from '../types';

/**
 * Regra de negócio do "Histórico simples de atividades realizadas"
 * pedido no briefing: pega só as tarefas concluídas e ordena da mais
 * recente para a mais antiga, para o idoso ver o que já fez sem se
 * perder em datas fora de ordem.
 */
export class TaskHistory {
  static getCompletedSortedByDate(tasks: Task[]): Task[] {
    if (!tasks || tasks.length === 0) return [];

    return tasks
      .filter((task) => task.completed)
      .slice()
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      });
  }
}
