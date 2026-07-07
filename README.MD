<!-- npm run dev -w seniorease-web -->

# SeniorEase 🌟 - Hackathon FIAP Inclusive

Plataforma unificada (Web e Mobile) focada em acessibilidade cognitiva e motora para usuários da terceira idade em ambientes acadêmicos e profissionais.

## 🏗️ Arquitetura do Projeto

O projeto utiliza uma estrutura de **Monorepo** gerenciada por **NPM Workspaces**:
- `apps/web`: Aplicação Desktop desenvolvida em **Next.js**.
- `apps/mobile`: Aplicativo Mobile desenvolvido em **React Native + Expo**.
- `packages/core-domain`: Camada isolada de regras de negócio aplicando **Clean Architecture**.

---

## 🛠️ Instruções de Setup

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- Node.js (v18 ou superior)
- NPM (v8 ou superior)

### 1. Clonar o Repositório e Instalar Dependências
Na raiz do projeto, execute o comando abaixo para instalar todas as dependências de forma centralizada e criar os links simbólicos dos workspaces:
```bash
npm install