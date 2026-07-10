import { db } from './firebase';
import { doc, writeBatch } from 'firebase/firestore';

export const seedCourses = async () => {
  try {
    const batch = writeBatch(db);

    // 1. Turma: Tecnologia para Iniciantes
    const cursoTecnologiaRef = doc(db, 'courses', 'tecnologia-iniciantes');
    batch.set(cursoTecnologiaRef, {
      name: 'Tecnologia para Iniciantes',
      description: 'Aprenda a dar os primeiros passos no computador e na internet com segurança.',
      tasks: [
        { title: 'Conhecer o Painel Principal do SeniorEase 🌟', category: 'Introdução' },
        { title: 'Experimentar o botão de aumentar o tamanho da letra', category: 'Treino' },
        { title: 'Assistir ao vídeo de boas-vindas do professor', category: 'Aulas' },
        { title: 'Realizar o primeiro clique no questionário de teste', category: 'Atividades' }
      ]
    });

    // 2. Turma: Uso do Smartphone e Whatsapp
    const cursoSmartphoneRef = doc(db, 'courses', 'smartphone-whatsapp');
    batch.set(cursoSmartphoneRef, {
      name: 'Uso do Smartphone e Whatsapp',
      description: 'Descubra como se conectar com sua família, enviar áudios e usar aplicativos.',
      tasks: [
        { title: 'Localizar e entender o botão de gravar áudio 🎙️', category: 'Aulas' },
        { title: 'Enviar a primeira mensagem de texto no ambiente de treino', category: 'Prática' },
        { title: 'Aprender a salvar um novo contato na agenda do celular', category: 'Aulas' },
        { title: 'Ativar o modo de alta visibilidade nas configurações do app', category: 'Treino' }
      ]
    });

    await batch.commit();
    console.log('✅ Cursos e atividades oficiais gravados no Firestore!');
  } catch (error) {
    console.error('Erro ao popular cursos:', error);
  }
};