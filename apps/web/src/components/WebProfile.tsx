'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';

interface UserProfile {
  name?: string;
  email?: string;
}

export default function WebProfile() {
  const { prefs } = useAccessibility();

  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar perfil:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    muted: prefs.highContrast ? '#fde047' : '#64748b',
  };

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';

    return type === 'title'
      ? isExtra
        ? '32px'
        : isLarge
        ? '28px'
        : '24px'
      : isExtra
      ? '20px'
      : isLarge
      ? '18px'
      : '15px';
  };

  if (loading) {
    return (
      <p style={{ color: theme.muted }}>
        Carregando informações do perfil...
      </p>
    );
  }

  const user = auth.currentUser;

  return (
    <div
      style={{
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <header>
        <h1
          style={{
            margin: 0,
            color: theme.text,
            fontSize: getFontSize('title'),
          }}
        >
          Meu Perfil 👤
        </h1>

        <p
          style={{
            color: theme.muted,
            fontSize: getFontSize('body'),
          }}
        >
          Informações da sua conta e do seu progresso na plataforma.
        </p>
      </header>

      <div
        style={{
          backgroundColor: theme.card,
          border: `3px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <InfoItem
          label="Nome"
          value={profile.name || 'Não informado'}
          theme={theme}
          size={getFontSize('body')}
        />

        <InfoItem
          label="E-mail"
          value={profile.email || user?.email || 'Não informado'}
          theme={theme}
          size={getFontSize('body')}
        />

        <InfoItem
          label="Identificador da Conta"
          value={user?.uid || 'Não disponível'}
          theme={theme}
          size={getFontSize('body')}
        />

        <InfoItem
          label="Modo Simplificado"
          value={prefs.simplifiedMode ? 'Ativado' : 'Desativado'}
          theme={theme}
          size={getFontSize('body')}
        />

        <InfoItem
          label="Alto Contraste"
          value={prefs.highContrast ? 'Ativado' : 'Desativado'}
          theme={theme}
          size={getFontSize('body')}
        />

        <InfoItem
          label="Tamanho da Fonte"
          value={prefs.fontSize}
          theme={theme}
          size={getFontSize('body')}
        />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  theme,
  size,
}: {
  label: string;
  value: string;
  theme: any;
  size: string;
}) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          color: theme.muted,
          fontWeight: 'bold',
          fontSize: size,
        }}
      >
        {label}
      </p>

      <p
        style={{
          marginTop: '6px',
          color: theme.text,
          fontSize: size,
        }}
      >
        {value}
      </p>
    </div>
  );
}