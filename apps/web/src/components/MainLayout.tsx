'use client';

import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import WebDashboard from './WebDashboard';
import WebTasks from './WebTasks';
import WebSettings from './WebSettings';

export default function MainLayout() {
  const { prefs } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<'courses' | 'tasks' | 'settings'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Paleta adaptável baseada nas preferências de acessibilidade
  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    sidebarBg: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    activeBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    activeText: prefs.highContrast ? '#ffffff' : '#1e40af',
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentTab('tasks');
  };

  const getFontSize = () => {
    if (prefs.fontSize === 'extra-large') return '22px';
    if (prefs.fontSize === 'large') return '19px';
    return '16px';
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'courses':
        return <WebDashboard onSelectCourse={handleSelectCourse} />;
      case 'tasks':
        return (
          <WebTasks 
            activeCourseFilter={selectedCourseId} 
            onClearFilter={() => setSelectedCourseId(null)} 
          />
        );
      case 'settings':
        return <WebSettings />;
      default:
        return <WebDashboard onSelectCourse={handleSelectCourse} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, fontFamily: 'sans-serif' }}>
      
      {/* 🧭 BARRA LATERAL ACESSÍVEL (Único local de navegação e ajustes agora) */}
      <nav style={{
        width: prefs.spacing === 'wide' ? '320px' : '260px',
        backgroundColor: theme.sidebarBg,
        borderRight: `3px solid ${theme.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: prefs.spacing === 'wide' ? '20px' : '12px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text, marginBottom: '20px', textAlign: 'center' }}>
          Plataforma Digital 🎓
        </div>

        <button
          onClick={() => { setSelectedCourseId(null); setCurrentTab('courses'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px', 
            border: `2px solid ${currentTab === 'courses' ? theme.borderColor : 'transparent'}`,
            borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: getFontSize(),
            backgroundColor: currentTab === 'courses' ? theme.activeBg : 'transparent', color: theme.text
          }}
        >
          <span style={{ fontSize: '28px' }}>🎓</span> Cursos
        </button>

        <button
          onClick={() => setCurrentTab('tasks')}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px', 
            border: `2px solid ${currentTab === 'tasks' ? theme.borderColor : 'transparent'}`,
            borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: getFontSize(),
            backgroundColor: currentTab === 'tasks' ? theme.activeBg : 'transparent', color: theme.text
          }}
        >
          <span style={{ fontSize: '28px' }}>📋</span> Minhas Tarefas
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px', 
            border: `2px solid ${currentTab === 'settings' ? theme.borderColor : 'transparent'}`,
            borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: getFontSize(),
            backgroundColor: currentTab === 'settings' ? theme.activeBg : 'transparent', color: theme.text
          }}
        >
          <span style={{ fontSize: '28px' }}>⚙️</span> Ajustes
        </button>
      </nav>

      {/* 💻 CONTEÚDO PRINCIPAL (Sem o painel/botão "Ajustar Tela" superior) */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}