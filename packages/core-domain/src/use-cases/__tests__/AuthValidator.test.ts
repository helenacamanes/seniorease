import { AuthValidator } from '../AuthValidator';

describe('AuthValidator', () => {
  it('traduz "auth/invalid-credential" para uma mensagem amigável em português', () => {
    const message = AuthValidator.formatError('auth/invalid-credential');
    expect(message).toBe('O e-mail ou a senha não estão corretos. Verifique e tente com calma.');
  });

  it('traduz "auth/email-already-in-use" para uma mensagem amigável', () => {
    const message = AuthValidator.formatError('auth/email-already-in-use');
    expect(message).toContain('já está cadastrado');
  });

  it('traduz "auth/weak-password" para uma mensagem amigável', () => {
    const message = AuthValidator.formatError('auth/weak-password');
    expect(message).toContain('muito curta');
  });

  it('traduz "auth/invalid-email" para uma mensagem amigável', () => {
    const message = AuthValidator.formatError('auth/invalid-email');
    expect(message).toContain('e-mail não parece correto');
  });

  it('retorna uma mensagem genérica para códigos de erro desconhecidos', () => {
    const message = AuthValidator.formatError('auth/algum-erro-nao-mapeado');
    expect(message).toBe('Ops! Algo deu errado. Verifique a sua conexão e tente novamente.');
  });

  it('nunca expõe o código técnico do erro ao usuário final', () => {
    const message = AuthValidator.formatError('auth/network-request-failed');
    expect(message).not.toMatch(/auth\//);
  });
});
