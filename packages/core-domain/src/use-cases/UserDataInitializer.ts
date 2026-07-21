import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { AccessibilityPreferences } from '../accessibility/preferences';

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontSize: 'normal',
  highContrast: false,
  spacing: 'normal',
  simplifiedMode: false,
  extraConfirmation: true,
  reminderFrequency: 'none',
  enhancedFeedback: true,
};

export const inicializarPerfilE_Tarefas = async (
  db: any,
  uid: string,
  name: string,
  email: string,
  cursoId: string,
  // 🌟 Preferências que o usuário já escolheu ANTES de criar a conta
  // (na tela de boas-vindas / preferências). Se nada for passado,
  // caímos no padrão de sempre.
  initialPrefs?: Partial<AccessibilityPreferences>
) => {
  try {
    const courseDocRef = doc(db, 'courses', cursoId);
    const courseSnapshot = await getDoc(courseDocRef);

    let tarefasParaCopiar: any[] = [];
    let nomeAmigavelCurso = 'Curso Geral';

    if (courseSnapshot.exists()) {
      const data = courseSnapshot.data();
      tarefasParaCopiar = data.tasks || [];
      nomeAmigavelCurso = data.name || nomeAmigavelCurso;
    } else {
      tarefasParaCopiar = [
        { title: 'Assistir ao vídeo de introdução da plataforma', category: 'Introdução' }
      ];
    }

    const finalPreferences: AccessibilityPreferences = {
      ...DEFAULT_PREFERENCES,
      ...initialPrefs,
    };

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      name: name || 'Estudante Conectado',
      email: email,
      selectedCourse: nomeAmigavelCurso,
      courseId: cursoId,
      createdAt: new Date(),
      preferences: finalPreferences,
    });

    const userTasksCollectionRef = collection(db, 'users', uid, 'tasks');
    for (const tarefa of tarefasParaCopiar) {
      const novaTarefaRef = doc(userTasksCollectionRef);
      await setDoc(novaTarefaRef, {
        title: tarefa.title,
        category: tarefa.category,
        completed: false,
        // 🌟 Necessário para o Web conseguir agrupar/filtrar tarefas por curso
        courseId: cursoId,
        courseName: nomeAmigavelCurso,
      });
    }
  } catch (error) {
    console.error("Erro no core-domain ao inicializar dados:", error);
    throw error;
  }
};
