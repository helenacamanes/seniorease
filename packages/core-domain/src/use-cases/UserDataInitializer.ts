import { doc, setDoc, collection, getDoc } from 'firebase/firestore';

export const inicializarPerfilE_Tarefas = async (
  db: any, 
  uid: string, 
  name: string, 
  email: string, 
  cursoId: string
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

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      name: name || 'Estudante Conectado',
      email: email,
      selectedCourse: nomeAmigavelCurso,
      courseId: cursoId,
      createdAt: new Date(),
      preferences: {
        fontSize: 'normal',
        highContrast: false,
        spacing: 'normal',
        simplifiedMode: false,
        extraConfirmation: true
      }
    });

    const userTasksCollectionRef = collection(db, 'users', uid, 'tasks');
    for (const tarefa of tarefasParaCopiar) {
      const novaTarefaRef = doc(userTasksCollectionRef);
      await setDoc(novaTarefaRef, {
        title: tarefa.title,
        category: tarefa.category,
        completed: false
      });
    }
  } catch (error) {
    console.error("Erro no core-domain ao inicializar dados:", error);
    throw error;
  }
};