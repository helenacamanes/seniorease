'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAccessibility } from '../context/AccessibilityContext';
import { TaskHistory, type Task } from '@seniorease/domain';

// 🌟 "Histórico simples de atividades realizadas" pedido no briefing.
export default function WebHistory() {
  const { prefs } = useAccessibility();
  const [history, setHistory] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setHistory([]);
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
          setHistory(TaskHistory.getCompletedSortedByDate(tasksList));
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao carregar histórico na Web:', error);
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
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? '32px' : isLarge ? '28px' : '24px') : (isExtra ? '20px' : isLarge ? '18px' : '15px');
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '32px', borderBottom: `2px solid ${theme.borderColor}`, paddingBottom: '20px' }}>
        <h1 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0 }}>Histórico de Atividades 🗂️</h1>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, marginTop: '10px' }}>
          Aqui ficam registradas as atividades que você já concluiu, da mais recente para a mais antiga.
        </p>
      </header>

      {loading ? (
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>Carregando seu histórico...</p>
      ) : history.length === 0 ? (
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>
          Você ainda não concluiu nenhuma atividade. Quando concluir, ela aparece aqui! 🌟
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((task) => (
            <div key={task.id} style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '14px', padding: '20px' }}>
              <span style={{ fontSize: getFontSize('body'), color: theme.text, fontWeight: 'bold' }}>✅ {task.title}</span>
              {task.completedAt && (
                <p style={{ fontSize: '14px', color: theme.textMuted, marginTop: '6px', margin: 0 }}>
                  Concluída em {formatDate(task.completedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
