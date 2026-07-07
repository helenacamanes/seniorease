// Exemplo de uma regra de negócio de Clean Architecture
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const getGuidedSteps = (taskTitle: string): string[] => {
  return ["Passo 1: Ler com calma", `Passo 2: Iniciar a tarefa: ${taskTitle}`, "Passo 3: Confirmar conclusão"];
};

export * from './use-cases/AuthValidator';