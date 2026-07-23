'use client';

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import WebDashboard from './WebDashboard';
import WebTasks from './WebTasks';
import WebHistory from './WebHistory';
import WebSettings from './WebSettings';
import ProfileScreen from './WebProfile';

type TabKey = 'courses' | 'tasks' | 'history' | 'settings' | 'profile';

export default function MainLayout() {
  const { prefs } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<TabKey>('courses');

  // Paleta adaptável baseada nas preferências de acessibilidade
  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    sidebarBg: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    activeBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    activeText: prefs.highContrast ? '#ffffff' : '#1e40af',
  };

  const handleSelectCourse = (_courseId: string) => {
    setCurrentTab('tasks');
  };

  const getFontSize = () => {
    if (prefs.fontSize === 'extra-large') return '22px';
    if (prefs.fontSize === 'large') return '19px';
    return '16px';
  };

  const navItems: { key: TabKey; icon: string; label: string }[] = prefs.simplifiedMode
    ? [
      { key: 'profile', icon: '👤', label: 'Meu Perfil' },
      { key: 'tasks', icon: '📋', label: 'Tarefas' },
      { key: 'settings', icon: '⚙️', label: 'Ajustes' }
    ]
    : [
      { key: 'profile', icon: '👤', label: 'Meu Perfil' },
      { key: 'tasks', icon: '📋', label: 'Tarefas' },
      { key: 'history', icon: '🗂️', label: 'Histórico' },
      { key: 'settings', icon: '⚙️', label: 'Ajustes' }
    ];

  useEffect(() => {
    if (prefs.simplifiedMode && currentTab === 'courses') {
      setCurrentTab('tasks');
    }
  }, [prefs.simplifiedMode, currentTab]);

  const renderContent = () => {
    switch (currentTab) {
      case 'courses':
        return <WebDashboard onSelectCourse={handleSelectCourse} />;
      case 'tasks':
        return <WebTasks />;
      case 'history':
        return <WebHistory />;
      case 'settings':
        return <WebSettings />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <WebTasks />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, fontFamily: 'sans-serif' }}>

      {/* 🧭 BARRA LATERAL ACESSÍVEL */}
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

        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentTab(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '16px',
              border: `2px solid ${currentTab === item.key ? theme.borderColor : 'transparent'}`,
              borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: getFontSize(),
              backgroundColor: currentTab === item.key ? theme.activeBg : 'transparent', color: theme.text
            }}
          >
            <span style={{ fontSize: '28px' }}>{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>

      {/* 💻 CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}