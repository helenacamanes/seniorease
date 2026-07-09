'use client';

import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const COURSES_SUMMARY = [
  { id: 'curso-ti', title: '💻 Introdução ao Celular e Internet', progress: 50, totalTasks: 2, completedTasks: 1 },
  { id: 'curso-financas', title: '💰 Finanças Pessoais Práticas', progress: 0, totalTasks: 1, completedTasks: 0 }
];

interface WebDashboardProps {
  onSelectCourse: (courseId: string) => void;
}

export default function WebDashboard({ onSelectCourse }: WebDashboardProps) {
  const { prefs, userName } = useAccessibility();

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

      {/* Grid responsivo para telas maiores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: prefs.spacing === 'wide' ? '32px' : '20px'
      }}>
        {COURSES_SUMMARY.map(course => (
          <div
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            style={{
              backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px',
              padding: prefs.spacing === 'wide' ? '32px' : '20px', cursor: 'pointer', transition: 'transform 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
          >
            <h2 style={{ fontSize: getFontSize('body'),fontWeight: 'bold', color: theme.text, margin: '0 0 16px 0' }}>
              {course.title}
            </h2>
            
            {/* Barra de Progresso Estilizada */}
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
    </div>
  );
}