'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAccessibility } from '../context/AccessibilityContext';
import type { Task } from '@seniorease/domain';

interface WebTasksProps {
  activeCourseFilter: string | null;
  onClearFilter: () => void;
}

export default function WebTasks({ activeCourseFilter, onClearFilter }: WebTasksProps) {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 🌟 Escuta as tarefas reais do usuário logado no Firestore
  // (o mesmo caminho já usado pelo Mobile: users/{uid}/tasks)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const unsubscribeSnapshot = onSnapshot(
        tasksRef,
        (snapshot) => {
          const tasksList: Task[] = [];
          snapshot.forEach((docSnap) => {
            tasksList.push({ id: docSnap.id, ...docSnap.data() } as Task);
          });
          setTasks(tasksList);
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao carregar tarefas na Web:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eab308' : '#64748b',
    buttonActiveBg: prefs.highContrast ? '#16a34a' : '#22c55e',
    buttonClearBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    buttonClearText: prefs.highContrast ? '#facc15' : '#334155',
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? '28px' : isLarge ? '24px' : '20px') : (isExtra ? '20px' : isLarge ? '17px' : '15px');
  };

  const filteredTasks = activeCourseFilter ? tasks.filter((t) => t.courseId === activeCourseFilter) : tasks;
  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const finishedTasks = filteredTasks.filter((t) => t.completed);
  const currentCourseName = activeCourseFilter && filteredTasks.length > 0 ? filteredTasks[0].courseName : '';

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDocRef, { completed: !isCompleted });

      if (!isCompleted) alert('Parabéns! 🎉 Atividade concluída!');
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, completed: !isCompleted } : null));
      }
    } catch (error) {
      console.error('Erro ao alterar status da tarefa na Web:', error);
      alert('Não foi possível salvar o seu progresso. Verifique sua internet.');
    }
  };

  if (loading) {
    return (
      <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>
        Carregando suas atividades...
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ALERTA DE FILTRO SELECIONADO NA DASHBOARD */}
      {activeCourseFilter && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '14px' }}>
          <span style={{ fontSize: getFontSize('body'), color: theme.text }}>
            Mostrando tarefas de: <strong>{currentCourseName}</strong>
          </span>
          <button onClick={onClearFilter} style={{ padding: '12px 24px', cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', border: `2px solid ${theme.borderColor}`, backgroundColor: theme.buttonClearBg, color: theme.buttonClearText, fontSize: getFontSize('body') }}>
            📂 Mostrar Todas as Tarefas
          </button>
        </div>
      )}

      {/* ⏳ SEÇÃO: EM ANDAMENTO */}
      <h2 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0 }}>⏳ Atividades para Fazer ({activeTasks.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeTasks.length === 0 ? (
          <p style={{ color: theme.textMuted, fontStyle: 'italic', fontSize: getFontSize('body') }}>Nenhuma tarefa pendente! Excelente.</p>
        ) : (
          activeTasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '14px', padding: prefs.spacing === 'wide' ? '24px' : '16px' }}>
              <div onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', flex: 1 }}>
                <span style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, display: 'block' }}>{task.title}</span>
                {!activeCourseFilter && task.courseName && <span style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 'bold' }}>{task.courseName}</span>}
              </div>
              <button onClick={() => toggleTask(task.id, task.completed)} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${theme.borderColor}`, backgroundColor: theme.buttonClearBg, color: theme.text, fontSize: getFontSize('body') }}>
                ⬜ Marcar como Feita
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ SEÇÃO: CONCLUÍDAS */}
      <h2 style={{ fontSize: getFontSize('title'), color: theme.text, margin: '20px 0 0 0' }}>✅ Concluídas ({finishedTasks.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {finishedTasks.map((task) => (
          <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '14px', padding: prefs.spacing === 'wide' ? '24px' : '16px', opacity: 0.75 }}>
            <div onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', flex: 1 }}>
              <span style={{ fontSize: getFontSize('body'), color: theme.text, textDecoration: 'line-through', display: 'block' }}>{task.title}</span>
            </div>
            <button onClick={() => toggleTask(task.id, task.completed)} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '8px', border: 'transparent', backgroundColor: theme.buttonActiveBg, color: '#ffffff', fontWeight: 'bold', fontSize: getFontSize('body') }}>
              💚 Concluída! (Refazer)
            </button>
          </div>
        ))}
      </div>

      {/* 📝 MODAL DETALHADO (WEB) */}
      {selectedTask && (
        <div onClick={() => setSelectedTask(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, border: `4px solid ${theme.borderColor}`, borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedTask.courseName && (
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textMuted, textTransform: 'uppercase' }}>{selectedTask.courseName}</span>
            )}
            <h3 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0 }}>{selectedTask.title}</h3>

            <button onClick={() => toggleTask(selectedTask.id, selectedTask.completed)} style={{ padding: '16px', cursor: 'pointer', borderRadius: '12px', border: 'none', backgroundColor: selectedTask.completed ? theme.buttonClearBg : theme.buttonActiveBg, color: selectedTask.completed ? theme.text : '#ffffff', fontWeight: 'bold', fontSize: getFontSize('body') }}>
              {selectedTask.completed ? '↩️ Marcar como Não Feita' : '✔️ Concluir esta Atividade'}
            </button>
            <button onClick={() => setSelectedTask(null)} style={{ padding: '12px', cursor: 'pointer', borderRadius: '12px', border: `2px solid ${theme.borderColor}`, backgroundColor: 'transparent', color: theme.text, fontWeight: 'bold', fontSize: getFontSize('body') }}>
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
