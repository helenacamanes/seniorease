'use client';

import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function WebSettings() {
  const { prefs, updatePrefs } = useAccessibility();

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eab308' : '#64748b',
    buttonBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    buttonActiveBg: prefs.highContrast ? '#facc15' : '#1e40af',
    buttonActiveText: prefs.highContrast ? '#000000' : '#ffffff',
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? '32px' : isLarge ? '28px' : '24px') : (isExtra ? '20px' : isLarge ? '18px' : '15px');
  };

  const updatePreference = (key: keyof typeof prefs, value: any) => {
    updatePrefs({ ...(prefs as any), [key]: value });
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <header style={{ borderBottom: `2px solid ${theme.borderColor}`, paddingBottom: '20px' }}>
        <h1 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0 }}>Ajustes de Acessibilidade ⚙️</h1>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, marginTop: '10px' }}>
          Escolha as opções abaixo para deixar a leitura do aplicativo mais confortável para você.
        </p>
      </header>

      {/* 🅰️ SEÇÃO: TAMANHO DA LETRA */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>🅰️ Tamanho do Texto</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {(['normal', 'large', 'extra-large'] as const).map((size) => {
            const isActive = prefs.fontSize === size;
            const labels = { normal: 'Padrão', large: 'Grande', 'extra-large': 'Muito Grande' };
            return (
              <button
                key={size}
                onClick={() => updatePreference('fontSize', size)}
                style={{
                  padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
                  backgroundColor: isActive ? theme.buttonActiveBg : theme.buttonBg,
                  color: isActive ? theme.buttonActiveText : theme.text
                }}
              >
                {labels[size]}
              </button>
            );
          })}
        </div>
      </section>

      {/* ↕️ SEÇÃO: ESPAÇAMENTO */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>↕️ Espaçamento das Telas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {(['normal', 'wide'] as const).map((space) => {
            const isActive = prefs.spacing === space;
            return (
              <button
                key={space}
                onClick={() => updatePreference('spacing', space)}
                style={{
                  padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
                  backgroundColor: isActive ? theme.buttonActiveBg : theme.buttonBg,
                  color: isActive ? theme.buttonActiveText : theme.text
                }}
              >
                {space === 'normal' ? 'Espaço Normal' : 'Mais Espaço entre Itens'}
              </button>
            );
          })}
        </div>
      </section>

      {/* 🎨 SEÇÃO: ALTO CONTRASTE */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>🎨 Cores da Tela</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => updatePreference('highContrast', false)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: !prefs.highContrast ? theme.buttonActiveBg : theme.buttonBg,
              color: !prefs.highContrast ? theme.buttonActiveText : theme.text
            }}
          >
            ⚪ Cores Normais (Claro)
          </button>
          <button
            onClick={() => updatePreference('highContrast', true)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: prefs.highContrast ? theme.buttonActiveBg : theme.buttonBg,
              color: prefs.highContrast ? theme.buttonActiveText : theme.text
            }}
          >
            ⚫ Alto Contraste (Fundo Preto)
          </button>
        </div>
      </section>

      {/* 🧭 SEÇÃO: MODO DE NAVEGAÇÃO */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>🧭 Modo de Navegação</h2>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, margin: 0 }}>
          O Modo Simplificado deixa o menu com menos opções e mostra só o essencial na tela.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => updatePreference('simplifiedMode', false)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: !prefs.simplifiedMode ? theme.buttonActiveBg : theme.buttonBg,
              color: !prefs.simplifiedMode ? theme.buttonActiveText : theme.text
            }}
          >
            📋 Modo Padrão
          </button>
          <button
            onClick={() => updatePreference('simplifiedMode', true)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: prefs.simplifiedMode ? theme.buttonActiveBg : theme.buttonBg,
              color: prefs.simplifiedMode ? theme.buttonActiveText : theme.text
            }}
          >
            ✨ Modo Simplificado
          </button>
        </div>
      </section>

      {/* 🔒 SEÇÃO: CONFIRMAÇÃO ANTES DE AÇÕES IMPORTANTES */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>🔒 Confirmação antes de Sair</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => updatePreference('extraConfirmation', false)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: !prefs.extraConfirmation ? theme.buttonActiveBg : theme.buttonBg,
              color: !prefs.extraConfirmation ? theme.buttonActiveText : theme.text
            }}
          >
            Sair Direto, Sem Avisar
          </button>
          <button
            onClick={() => updatePreference('extraConfirmation', true)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: prefs.extraConfirmation ? theme.buttonActiveBg : theme.buttonBg,
              color: prefs.extraConfirmation ? theme.buttonActiveText : theme.text
            }}
          >
            🔒 Sempre Perguntar Antes
          </button>
        </div>
      </section>

      {/* 📅 SEÇÃO: LEMBRETES DE ESTUDO */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>📅 Lembretes de Estudo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {(['none', 'daily', 'weekly'] as const).map((freq) => {
            const isActive = prefs.reminderFrequency === freq;
            const labels = { none: 'Não Avisar', daily: 'Todo Dia 📅', weekly: 'Toda Semana 🗓️' };
            return (
              <button
                key={freq}
                onClick={() => updatePreference('reminderFrequency', freq)}
                style={{
                  padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
                  backgroundColor: isActive ? theme.buttonActiveBg : theme.buttonBg,
                  color: isActive ? theme.buttonActiveText : theme.text
                }}
              >
                {labels[freq]}
              </button>
            );
          })}
        </div>
      </section>

      {/* 🎉 SEÇÃO: FEEDBACK VISUAL REFORÇADO */}
      <section style={{ backgroundColor: theme.card, border: `3px solid ${theme.borderColor}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: theme.text, margin: 0 }}>🎉 Feedback Visual Reforçado</h2>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, margin: 0 }}>
          Quando ligado, o sistema mostra uma confirmação visual maior (com cor, ícone e animação) sempre que uma ação der certo, como concluir uma atividade.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => updatePreference('enhancedFeedback', false)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: !prefs.enhancedFeedback ? theme.buttonActiveBg : theme.buttonBg,
              color: !prefs.enhancedFeedback ? theme.buttonActiveText : theme.text
            }}
          >
            Feedback Simples
          </button>
          <button
            onClick={() => updatePreference('enhancedFeedback', true)}
            style={{
              padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: getFontSize('body'), border: `2px solid ${theme.borderColor}`,
              backgroundColor: prefs.enhancedFeedback ? theme.buttonActiveBg : theme.buttonBg,
              color: prefs.enhancedFeedback ? theme.buttonActiveText : theme.text
            }}
          >
            🎉 Feedback Reforçado
          </button>
        </div>
      </section>
    </div>
  );
}