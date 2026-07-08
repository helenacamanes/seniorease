import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function DashboardScreen() {
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SeniorEase 🌟</Text>
      <Text style={styles.subtitle}>Olá! Bem-vindo ao seu aplicativo móvel.</Text>
      
      <View style={styles.userCard}>
        <Text style={styles.userText}>Conectado como:</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Botão de toque massivo para o idoso conseguir clicar sem dificuldades */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair do Aplicativo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  userCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 40,
  },
  userText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  emailText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});