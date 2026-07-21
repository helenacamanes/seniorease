import { GetGuidedSteps } from '../GetGuidedSteps';

describe('GetGuidedSteps', () => {
  it('sempre inclui o título da tarefa no primeiro passo', () => {
    const steps = GetGuidedSteps.execute({ title: 'Enviar uma foto no WhatsApp' });
    expect(steps[0]).toContain('Enviar uma foto no WhatsApp');
  });

  it('inclui a categoria como um passo extra quando ela existe', () => {
    const steps = GetGuidedSteps.execute({ title: 'Ativar alto contraste', category: 'Treino' });
    expect(steps.some((step) => step.includes('Treino'))).toBe(true);
  });

  it('não inclui passo de categoria quando ela não é informada', () => {
    const steps = GetGuidedSteps.execute({ title: 'Assistir vídeo de boas-vindas' });
    expect(steps.some((step) => step.toLowerCase().includes('categoria'))).toBe(false);
  });

  it('sempre termina com um passo de confirmação explícita', () => {
    const steps = GetGuidedSteps.execute({ title: 'Qualquer atividade' });
    expect(steps[steps.length - 1]).toContain('Concluir Atividade');
  });

  it('retorna pelo menos 3 passos (leitura, execução e confirmação)', () => {
    const steps = GetGuidedSteps.execute({ title: 'Qualquer atividade' });
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });
});
