export class AuthValidator {
  static formatError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'O e-mail ou a senha não estão corretos. Verifique e tente com calma.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado. Que tal tentar entrar com a sua senha?';
      case 'auth/weak-password':
        return 'A senha escolhida é muito curta. Tente colocar pelo menos 6 números ou letras.';
      case 'auth/invalid-email':
        return 'Esse formato de e-mail não parece correto. Certifique-se de que colocou o "@" e o ".com".';
      default:
        return 'Ops! Algo deu errado. Verifique a sua conexão e tente novamente.';
    }
  }
}