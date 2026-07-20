'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAccessibility } from '../context/AccessibilityContext';
import { CalculateProgress, type Task } from '@seniorease/domain';

interface WebDashboardProps {
  onSelectCourse: (courseId: string) => void;
}

interface CourseSummary {
  courseId: string;
  courseName: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export default function WebDashboard({ onSelectCourse }: WebDashboardProps) {
  const { prefs, userName } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 Lê as tarefas reais do usuário (mesma coleção usada pelo Mobile)
  // e agrupa por curso para montar os cards de progresso.
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
          console.error('Erro ao carregar progresso na Web:', error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  const courses: CourseSummary[] = React.useMemo(() => {
    const groups = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const key = task.courseId || 'sem-curso';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(task);
    });

    return Array.from(groups.entries()).map(([courseId, courseTasks]) => ({
      courseId,
      courseName: courseTasks[0]?.courseName || 'Minhas Atividades',
      progress: CalculateProgress.execute(courseTasks),
      totalTasks: courseTasks.length,
      completedTasks: courseTasks.filter((t) => t.completed).length,
    }));
  }, [tasks]);

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eab308' : '#64748b',
    progressBg: prefs.highContrast ? '#333333' : '#e2e8f0',
    progressFill: prefs.highContrast ? '#16a34a' : '#22c55e',
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? '32px' : isLarge ? '28px' : '24px') : (isExtra ? '20px' : isLarge ? '18px' : '15px');
  };

  return (
    <div>
      <header style={{ marginBottom: '32px', borderBottom: `2px solid ${theme.borderColor}`, paddingBottom: '20px' }}>
        <h1 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0 }}>Seu Progresso 🎓</h1>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, marginTop: '10px' }}>
          Olá, {userName}! Clique em qualquer curso abaixo para gerenciar e executar suas tarefas.
        </p>
      </header>

      {loading ? (
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>Carregando seus cursos...</p>
      ) : courses.length === 0 ? (
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted }}>
          Você ainda não tem atividades cadastradas.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: prefs.spacing === 'wide' ? '32px' : '20px',
          }}
        >
          {courses.map((course) => (
            <div
              key={course.courseId}
              onClick={() => onSelectCourse(course.courseId)}
              style={{
                backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px',
                padding: prefs.spacing === 'wide' ? '32px' : '20px', cursor: 'pointer', transition: 'transform 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: '0 0 16px 0' }}>
                🎓 {course.courseName}
              </h2>

              <div style={{ width: '100%', backgroundColor: theme.progressBg, height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: `${course.progress}%`, backgroundColor: theme.progressFill, height: '100%' }} />
              </div>

              <p style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>
                {course.progress}% Concluído ({course.completedTasks}/{course.totalTasks})
              </p>
              <p style={{ color: theme.textMuted, fontSize: getFontSize('body'), marginTop: '8px', fontStyle: 'italic' }}>
                Clique para abrir as tarefas ➔
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
