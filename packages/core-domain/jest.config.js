/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    // UserDataInitializer depende diretamente do Firestore (não é lógica de
    // domínio pura), então fica fora da cobertura de testes unitários por ora.
    '!src/use-cases/UserDataInitializer.ts',
  ],
};
