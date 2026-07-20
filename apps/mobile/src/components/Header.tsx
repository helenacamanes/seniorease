import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAccessibility } from '../context/AccessibilityContext';

interface HeaderProps {
  title?: string;
}

export function Header({ title = "SeniorEase 🌟" }: HeaderProps) {
  const { prefs } = useAccessibility();

  const getFontSize = () => {
    if (prefs.fontSize === 'extra-large') return 21;
    if (prefs.fontSize === 'large') return 18;
    return 15;
  };

  const theme = {
    bg: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    border: prefs.highContrast ? '#ffff00' : '#e2e8f0',
    logoutBtn: prefs.highContrast ? '#000000' : '#fee2e2',
    logoutText: prefs.highContrast ? '#ffff00' : '#ef4444',
    logoutBorder: prefs.highContrast ? '#ffff00' : '#fca5a5',
  };

  const handleLogout = () => {
    if (prefs.extraConfirmation) {
      Alert.alert(
        "Aviso importante 🤔",
        "Você tem certeza que deseja sair da sua conta agora?",
        [
          { text: "Não, quero continuar estudando", style: "cancel" },
          { text: "Sim, quero sair", style: "destructive", onPress: () => signOut(auth) }
        ]
      );
    } else {
      signOut(auth);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text, fontSize: getFontSize() + 3 }]}>
        {title}
      </Text>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: theme.logoutBtn, borderColor: theme.logoutBorder }]} 
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Botão de sair da conta"
      >
        <Text style={[styles.logoutText, { color: theme.logoutText, fontSize: getFontSize() }]}>
          🚪 Sair
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48, 
    paddingBottom: 16,
    borderBottomWidth: 3,
  },
  title: {
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  logoutText: {
    fontWeight: 'bold',
  },
});