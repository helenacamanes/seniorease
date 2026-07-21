export interface GuidedTaskInput {
  title: string;
  category?: string;
}

/**
 * Gera os passos do fluxo guiado exibido antes de concluir uma atividade.
 * Regra pensada para o público idoso: poucos passos, linguagem calma,
 * sempre terminando com uma confirmação explícita.
 */
export class GetGuidedSteps {
  static execute(task: GuidedTaskInput): string[] {
    const steps: string[] = [
      `Leia com calma o nome da atividade: "${task.title}".`,
    ];

    if (task.category) {
      steps.push(`Essa atividade faz parte de: ${task.category}.`);
    }

    steps.push(
      'Quando estiver pronto, realize a atividade no seu tempo. Não há pressa.',
      'Terminou? Toque em "Concluir Atividade" para guardar o seu progresso.'
    );

    return steps;
  }
}
