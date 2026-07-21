import { TaskHistory } from '../TaskHistory';
import { Task } from '../../types';

const buildTask = (overrides: Partial<Task>): Task => ({
  id: 'id-1',
  title: 'Tarefa de teste',
  completed: false,
  ...overrides,
});

describe('TaskHistory', () => {
  it('retorna lista vazia quando não há tarefas', () => {
    expect(TaskHistory.getCompletedSortedByDate([])).toEqual([]);
  });

  it('ignora tarefas ainda não concluídas', () => {
    const tasks = [buildTask({ id: '1', completed: false })];
    expect(TaskHistory.getCompletedSortedByDate(tasks)).toEqual([]);
  });

  it('retorna apenas as tarefas concluídas', () => {
    const tasks = [
      buildTask({ id: '1', completed: false }),
      buildTask({ id: '2', completed: true, completedAt: '2026-01-01T10:00:00.000Z' }),
    ];
    const result = TaskHistory.getCompletedSortedByDate(tasks);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('ordena da mais recente para a mais antiga', () => {
    const tasks = [
      buildTask({ id: 'antiga', completed: true, completedAt: '2026-01-01T10:00:00.000Z' }),
      buildTask({ id: 'recente', completed: true, completedAt: '2026-03-01T10:00:00.000Z' }),
      buildTask({ id: 'meio', completed: true, completedAt: '2026-02-01T10:00:00.000Z' }),
    ];
    const result = TaskHistory.getCompletedSortedByDate(tasks);
    expect(result.map((t) => t.id)).toEqual(['recente', 'meio', 'antiga']);
  });

  it('não quebra quando uma tarefa concluída não tem completedAt', () => {
    const tasks = [
      buildTask({ id: 'sem-data', completed: true }),
      buildTask({ id: 'com-data', completed: true, completedAt: '2026-01-01T10:00:00.000Z' }),
    ];
    expect(() => TaskHistory.getCompletedSortedByDate(tasks)).not.toThrow();
    expect(TaskHistory.getCompletedSortedByDate(tasks)).toHaveLength(2);
  });
});
