'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAccessibility } from '../context/AccessibilityContext';
import { GetGuidedSteps, type Task } from '@seniorease/domain';
import SuccessToast from './WebSuccessToast';

interface WebTasksProps {
  activeCourseFilter: string | null;
  onClearFilter: () => void;
}

export default function WebTasks({ activeCourseFilter, onClearFilter }: WebTasksProps) {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [guidedTask, setGuidedTask] = useState<Task | null>(null);
  const [guidedStepIndex, setGuidedStepIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // 🌟 Modo Simplificado: começa com a seção de concluídas escondida,
  // para reduzir a quantidade de informação na tela de uma vez.
  const [showCompleted, setShowCompleted] = useState(!prefs.simplifiedMode);

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
    stepBg: prefs.highContrast ? '#1c1c1c' : '#f1f5f9',
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

  const performToggle = async (taskId: string, isCompleted: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        completed: !isCompleted,
        // 🌟 Guarda quando a tarefa foi concluída, usado no Histórico.
        completedAt: !isCompleted ? new Date().toISOString() : null,
      });

      if (!isCompleted) {
        // 🌟 Feedback Visual Reforçado: quando ligado, mostra um banner
        // animado com ícone e cor de sucesso em vez de um alert() simples.
        if (prefs.enhancedFeedback) {
          setSuccessMessage('Muito bem! Atividade concluída!');
        } else {
          alert('Parabéns! 🎉 Atividade concluída!');
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status da tarefa na Web:', error);
      alert('Não foi possível salvar o seu progresso. Verifique sua internet.');
    }
  };

  const toggleTask = (taskId: string, isCompleted: boolean) => {
    // 🌟 Confirmação adicional antes de ação crítica: desfazer uma atividade
    // já concluída apaga o registro dela do Histórico, então avisamos antes.
    if (isCompleted && prefs.extraConfirmation) {
      const confirmed = window.confirm(
        'Essa atividade vai voltar para "pendente" e sair do seu Histórico. Deseja continuar?'
      );
      if (!confirmed) return;
    }
    performToggle(taskId, isCompleted);
  };

  const openGuidedFlow = (task: Task) => {
    if (task.completed) return;
    setGuidedTask(task);
    setGuidedStepIndex(0);
  };

  const closeGuidedFlow = () => {
    setGuidedTask(null);
    setGuidedStepIndex(0);
  };

  if (loading) {
    return (
      <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>
        Carregando suas atividades...
      </p>
    );
  }

  const guidedSteps = guidedTask ? GetGuidedSteps.execute(guidedTask) : [];
  const isLastGuidedStep = guidedStepIndex === guidedSteps.length - 1;

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
              <div onClick={() => openGuidedFlow(task)} style={{ cursor: 'pointer', flex: 1 }}>
                <span style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, display: 'block' }}>{task.title}</span>
                {!prefs.simplifiedMode && !activeCourseFilter && task.courseName && (
                  <span style={{ color: theme.textMuted, fontSize: '13px', fontWeight: 'bold' }}>{task.courseName}</span>
                )}
                <span style={{ color: theme.textMuted, fontSize: '13px' }}>Clique para ver o passo a passo</span>
              </div>
              <button onClick={() => toggleTask(task.id, task.completed)} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '8px', border: `2px solid ${theme.borderColor}`, backgroundColor: theme.buttonClearBg, color: theme.text, fontSize: getFontSize('body') }}>
                ⬜ Marcar como Feita
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ SEÇÃO: CONCLUÍDAS (recolhível para reduzir informação na tela) */}
      <button
        onClick={() => setShowCompleted((prev) => !prev)}
        style={{ alignSelf: 'flex-start', padding: '10px 18px', borderRadius: '10px', border: `2px solid ${theme.borderColor}`, backgroundColor: theme.buttonClearBg, color: theme.text, fontWeight: 'bold', cursor: 'pointer', fontSize: getFontSize('body') }}
      >
        {showCompleted ? '🔽' : '▶️'} Concluídas ({finishedTasks.length})
      </button>

      {showCompleted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {finishedTasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '14px', padding: prefs.spacing === 'wide' ? '24px' : '16px', opacity: 0.75 }}>
              <span style={{ fontSize: getFontSize('body'), color: theme.text, textDecoration: 'line-through', display: 'block' }}>{task.title}</span>
              <button onClick={() => toggleTask(task.id, task.completed)} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '8px', border: 'transparent', backgroundColor: theme.buttonActiveBg, color: '#ffffff', fontWeight: 'bold', fontSize: getFontSize('body') }}>
                💚 Concluída! (Refazer)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 FLUXO GUIADO PASSO A PASSO */}
      {guidedTask && (
        <div onClick={closeGuidedFlow} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.card, border: `4px solid ${theme.borderColor}`, borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0, textAlign: 'center' }}>{guidedTask.title}</h3>
            <p style={{ textAlign: 'center', color: theme.textMuted, fontWeight: 'bold', fontSize: getFontSize('body'), margin: 0 }}>
              Passo {guidedStepIndex + 1} de {guidedSteps.length}
            </p>

            <div style={{ backgroundColor: theme.stepBg, borderRadius: '16px', padding: '24px', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: getFontSize('body'), color: theme.text, textAlign: 'center', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                {guidedSteps[guidedStepIndex]}
              </p>
            </div>

            {isLastGuidedStep ? (
              <button onClick={() => { toggleTask(guidedTask.id, guidedTask.completed); closeGuidedFlow(); }} style={{ padding: '16px', cursor: 'pointer', borderRadius: '12px', border: 'none', backgroundColor: theme.buttonActiveBg, color: '#ffffff', fontWeight: 'bold', fontSize: getFontSize('body') }}>
                ✨ Concluir Atividade!
              </button>
            ) : (
              <button onClick={() => setGuidedStepIndex((i) => i + 1)} style={{ padding: '16px', cursor: 'pointer', borderRadius: '12px', border: 'none', backgroundColor: theme.buttonActiveBg, color: '#ffffff', fontWeight: 'bold', fontSize: getFontSize('body') }}>
                Avançar Passo ➔
              </button>
            )}

            {guidedStepIndex > 0 && (
              <button onClick={() => setGuidedStepIndex((i) => i - 1)} style={{ padding: '12px', cursor: 'pointer', borderRadius: '12px', border: `2px solid ${theme.borderColor}`, backgroundColor: 'transparent', color: theme.text, fontWeight: 'bold', fontSize: getFontSize('body') }}>
                ⬅️ Passo Anterior
              </button>
            )}

            <button onClick={closeGuidedFlow} style={{ padding: '12px', cursor: 'pointer', borderRadius: '12px', border: `2px solid ${theme.borderColor}`, backgroundColor: 'transparent', color: theme.text, fontWeight: 'bold', fontSize: getFontSize('body') }}>
              Parar e Sair
            </button>
          </div>
        </div>
      )}

      {/* 🌟 FEEDBACK VISUAL REFORÇADO */}
      <SuccessToast
        visible={!!successMessage}
        message={successMessage || ''}
        onDismiss={() => setSuccessMessage(null)}
      />
    </div>
  );
}
