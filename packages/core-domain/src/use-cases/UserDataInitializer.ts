import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { AccessibilityPreferences } from '../accessibility/preferences';

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontSize: 'normal',
  highContrast: false,
  spacing: 'normal',
  basicMode: false,
  requireConfirmation: true,
  reduceAnimations: false,
  enhancedFeedback: true,
  notificationsEnabled: true,
  reminderTime: '09:00',

};

export const inicializarPerfilE_Tarefas = async (
  db: any,
  uid: string,
  name: string,
  email: string,
  cursoId: string,
  initialPrefs?: Partial<AccessibilityPreferences>
) => {
  let tarefasParaCopiar: any[] = [];
  let nomeAmigavelCurso = 'Curso Geral';

  try {
    const courseDocRef = doc(db, 'courses', cursoId);
    const courseSnapshot = await getDoc(courseDocRef);

    if (courseSnapshot.exists()) {
      const data = courseSnapshot.data();
      tarefasParaCopiar = data.tasks || [];
      nomeAmigavelCurso = data.name || nomeAmigavelCurso;
    } else {
      tarefasParaCopiar = [
        { title: 'Assistir ao vídeo de introdução da plataforma', category: 'Introdução' }
      ];
    }
  } catch (courseError) {
    console.warn("Aviso: Não foi possível carregar as tarefas do curso. Usando tarefas padrão.", courseError);
    tarefasParaCopiar = [
      { title: 'Assistir ao vídeo de introdução da plataforma', category: 'Introdução' }
    ];
  }

  const finalPreferences: AccessibilityPreferences = {
    ...DEFAULT_PREFERENCES,
    ...initialPrefs,
  };

  const userRef = doc(db, 'users', uid);

  try {
    await setDoc(userRef, {
      name: name || 'Estudante Conectado',
      email: email || '',
      selectedCourse: nomeAmigavelCurso,
      courseId: cursoId,
      createdAt: new Date(),
      preferences: finalPreferences,
    }, { merge: true });
  } catch (profileError) {
    console.error("Erro ao gravar perfil do usuário:", profileError);
    throw profileError;
  }

  try {
    const userTasksCollectionRef = collection(db, 'users', uid, 'tasks');
    for (const tarefa of tarefasParaCopiar) {
      const novaTarefaRef = doc(userTasksCollectionRef);
      await setDoc(novaTarefaRef, {
        title: tarefa.title,
        category: tarefa.category,
        completed: false,
        courseId: cursoId,
        courseName: nomeAmigavelCurso,
      });
    }
  } catch (tasksError) {
    console.error("Erro ao criar tarefas iniciais do usuário:", tasksError);
  }
};