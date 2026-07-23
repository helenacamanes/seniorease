import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { auth } from '../lib/firebase';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ProfileScreen() {
  const { prefs } = useAccessibility();

  const user = auth.currentUser;

  const theme = {
    background: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#cbd5e1',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    muted: prefs.highContrast ? '#fde047' : '#64748b',
  };

  const getFontSize = (title = false) => {
    if (prefs.fontSize === 'extra-large') {
      return title ? 30 : 20;
    }

    if (prefs.fontSize === 'large') {
      return title ? 26 : 18;
    }

    return title ? 22 : 15;
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
            fontSize: getFontSize(true),
          },
        ]}
      >
        Meu Perfil 👤
      </Text>

      <Text
        style={{
          color: theme.muted,
          fontSize: getFontSize(),
          marginBottom: 24,
        }}
      >
        Informações da sua conta na plataforma.
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <ProfileItem
          label="Nome"
          value={user?.displayName || 'Não informado'}
          theme={theme}
          size={getFontSize()}
        />

        <ProfileItem
          label="E-mail"
          value={user?.email || 'Não informado'}
          theme={theme}
          size={getFontSize()}
        />

        <ProfileItem
          label="UID"
          value={user?.uid || 'Não disponível'}
          theme={theme}
          size={getFontSize()}
        />

        <ProfileItem
          label="Modo Simplificado"
          value={prefs.simplifiedMode ? 'Ativado' : 'Desativado'}
          theme={theme}
          size={getFontSize()}
        />

        <ProfileItem
          label="Alto Contraste"
          value={prefs.highContrast ? 'Ativado' : 'Desativado'}
          theme={theme}
          size={getFontSize()}
        />

        <ProfileItem
          label="Fonte"
          value={prefs.fontSize}
          theme={theme}
          size={getFontSize()}
        />
      </View>
    </ScrollView>
  );
}

function ProfileItem({
  label,
  value,
  theme,
  size,
}: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: theme.muted,
          fontWeight: 'bold',
          fontSize: size,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: size,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },

  card: {
    borderWidth: 3,
    borderRadius: 16,
    padding: 24,
  },
});