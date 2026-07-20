import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { CalculateProgress } from '@seniorease/domain';
import { Header } from '../components/Header'; 

export default function DashboardScreen() {
  const { prefs } = useAccessibility();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  const getFontSize = (type: 'title' | 'body' | 'percentage') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    if (type === 'percentage') return 36 + modifier;
    if (type === 'title') return 22 + modifier;
    return 18 + modifier;
  };

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    textMuted: prefs.highContrast ? '#ffffff' : '#64748b',
    border: prefs.highContrast ? '#ffff00' : '#cbd5e1',
    progressBg: prefs.highContrast ? '#1c1c1c' : '#e2e8f0',
    progressFill: prefs.highContrast ? '#ffff00' : '#16a34a',
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', userId, 'tasks');
    
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasksList: { completed: boolean }[] = [];
      snapshot.forEach((doc) => {
        tasksList.push({ completed: doc.data().completed || false });
      });

      const computedProgress = CalculateProgress.execute(tasksList);
      setProgress(computedProgress);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao computar progresso no dashboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={prefs.highContrast ? '#ffff00' : '#2563eb'} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* 🌟 O Header isolado e reutilizável aplicado lindamente aqui */}
      <Header title="Minhas Atividades 🌟" />

      <ScrollView contentContainerStyle={[styles.container, { padding: prefs.spacing === 'wide' ? 24 : 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, gap: prefs.spacing === 'wide' ? 20 : 12 }]}>
          
          <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>
            Seu Progresso de Hoje 🚀
          </Text>
          
          <Text style={[styles.percentageText, { color: prefs.highContrast ? '#ffff00' : '#2563eb', fontSize: getFontSize('percentage') }]}>
            {progress}% Concluído
          </Text>
          
          <View style={[styles.progressBarBackground, { backgroundColor: theme.progressBg }]}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.progressFill }]} />
          </View>

          <Text style={[styles.motivationalText, { color: theme.textMuted, fontSize: getFontSize('body'), lineHeight: prefs.spacing === 'wide' ? 30 : 24 }]}>
            {progress === 100 
              ? "Parabéns! Você completou todas as atividades de hoje! 🎉" 
              : "Continue assim! Cada pequeno passo conta na nossa jornada digital. 🧑‍💻"}
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, justifyContent: 'center' },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontWeight: 'bold', textAlign: 'center' },
  percentageText: { fontWeight: '900', marginVertical: 4 },
  progressBarBackground: {
    width: '100%',
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 14,
  },
  motivationalText: { textAlign: 'center', fontWeight: '500' }
});