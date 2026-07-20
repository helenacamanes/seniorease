import { CalculateProgress } from '../CalculateProgress';

describe('CalculateProgress', () => {
  it('retorna 0 quando a lista de tarefas está vazia', () => {
    expect(CalculateProgress.execute([])).toBe(0);
  });

  it('retorna 0 quando recebe undefined/null (defesa contra dados inesperados do Firestore)', () => {
    // @ts-expect-error - testando entrada inválida de propósito
    expect(CalculateProgress.execute(undefined)).toBe(0);
    // @ts-expect-error - testando entrada inválida de propósito
    expect(CalculateProgress.execute(null)).toBe(0);
  });

  it('retorna 100 quando todas as tarefas estão concluídas', () => {
    const tasks = [{ completed: true }, { completed: true }];
    expect(CalculateProgress.execute(tasks)).toBe(100);
  });

  it('retorna 0 quando nenhuma tarefa está concluída', () => {
    const tasks = [{ completed: false }, { completed: false }];
    expect(CalculateProgress.execute(tasks)).toBe(0);
  });

  it('calcula corretamente uma porcentagem parcial', () => {
    const tasks = [{ completed: true }, { completed: false }, { completed: false }];
    // 1/3 = 33.33...% -> arredondado para 33
    expect(CalculateProgress.execute(tasks)).toBe(33);
  });

  it('arredonda para o inteiro mais próximo (evita números quebrados na tela do idoso)', () => {
    const tasks = [
      { completed: true },
      { completed: true },
      { completed: false },
    ];
    // 2/3 = 66.66...% -> arredondado para 67
    expect(CalculateProgress.execute(tasks)).toBe(67);
  });
});
