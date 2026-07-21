'use client';

import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 🌟 Confirmação visual antes de ações críticas (sair da conta, desfazer uma
// tarefa concluída, etc). Substitui o window.confirm() nativo do navegador,
// que não respeita alto contraste nem tamanho de fonte escolhidos pelo usuário.
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Sim, confirmar',
  cancelLabel = 'Não, cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { prefs } = useAccessibility();

  if (!visible) return null;

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eeeeee' : '#64748b',
    cancelBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    cancelText: prefs.highContrast ? '#facc15' : '#334155',
    confirmBg: destructive ? (prefs.highContrast ? '#7f1d1d' : '#ef4444') : (prefs.highContrast ? '#facc15' : '#2563eb'),
    confirmText: destructive ? '#ffffff' : (prefs.highContrast ? '#000000' : '#ffffff'),
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? '26px' : isLarge ? '23px' : '20px') : (isExtra ? '20px' : isLarge ? '17px' : '15px');
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 3000, padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.card, border: `3px solid ${theme.border}`, borderRadius: '24px',
          padding: '32px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        <h3 style={{ fontSize: getFontSize('title'), color: theme.text, margin: 0, textAlign: 'center', fontWeight: 'bold' }}>
          {title}
        </h3>
        <p style={{ fontSize: getFontSize('body'), color: theme.textMuted, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          {message}
        </p>

        <button
          onClick={onCancel}
          style={{
            padding: '16px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer',
            fontSize: getFontSize('body'), border: `2px solid ${theme.border}`,
            backgroundColor: theme.cancelBg, color: theme.cancelText, minHeight: '56px',
          }}
        >
          {cancelLabel}
        </button>

        <button
          onClick={onConfirm}
          style={{
            padding: '16px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer',
            fontSize: getFontSize('body'), border: 'none',
            backgroundColor: theme.confirmBg, color: theme.confirmText, minHeight: '56px',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
