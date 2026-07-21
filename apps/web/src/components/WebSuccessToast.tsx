'use client';

import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

interface SuccessToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

// 🌟 "Ativação de feedback visual reforçado" pedido no briefing.
// Quando `enhancedFeedback` está ligado, mostramos este banner animado
// (cor + ícone + entrada/saída suave) em vez de só um alert() simples.
export default function SuccessToast({ visible, message, onDismiss }: SuccessToastProps) {
  const { prefs } = useAccessibility();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShow(true);
    const hideTimer = setTimeout(() => setShow(false), 1600);
    const dismissTimer = setTimeout(() => onDismiss(), 1900);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(dismissTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#16a34a',
    text: prefs.highContrast ? '#facc15' : '#ffffff',
    iconBg: prefs.highContrast ? '#facc15' : '#ffffff',
    iconColor: prefs.highContrast ? '#000000' : '#16a34a',
    border: prefs.highContrast ? '3px solid #facc15' : 'none',
  };

  const fontSize = prefs.fontSize === 'extra-large' ? '22px' : prefs.fontSize === 'large' ? '19px' : '17px';

  return (
    <div
      style={{
        position: 'fixed',
        top: '32px',
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? '0' : '-30px'})`,
        opacity: show ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: theme.bg,
        color: theme.text,
        border: theme.border,
        borderRadius: '18px',
        padding: '20px 28px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        maxWidth: '90vw',
      }}
    >
      <span
        style={{
          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.iconBg,
          color: theme.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '22px', flexShrink: 0,
        }}
      >
        ✓
      </span>
      <span style={{ fontWeight: 'bold', fontSize }}>{message}</span>
    </div>
  );
}
