import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

const COURSES_SUMMARY = [
  { id: 'curso-ti', title: '💻 Introdução ao Celular e Internet', progress: 50, totalTasks: 2, completedTasks: 1 },
  { id: 'curso-financas', title: '💰 Finanças Pessoais Práticas', progress: 0, totalTasks: 1, completedTasks: 0 }
];

interface DashboardScreenProps {
  onSelectCourse: (courseId: string) => void;
}

export default function DashboardScreen({ onSelectCourse }: DashboardScreenProps) {
  const { prefs, userName } = useAccessibility();

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? 28 : isLarge ? 24 : 20) : (isExtra ? 20 : isLarge ? 18 : 15);
  };

  const theme = {
    container: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eab308' : '#64748b',
    headerBg: prefs.highContrast ? '#000000' : '#ffffff',
    progressBarBg: prefs.highContrast ? '#333333' : '#e2e8f0',
    progressBarFill: prefs.highContrast ? '#16a34a' : '#22c55e',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.container }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.title, { fontSize: getFontSize('title') + 4, color: theme.text }]}>
          Seu Progresso 🎓
        </Text>
        <Text style={{ fontSize: getFontSize('body'), color: theme.textMuted, marginTop: 6, lineHeight: 24 }}>
          Olá, {userName}! Toque em qualquer curso abaixo para ver e fazer suas atividades.
        </Text>
      </View>

      <View style={{ gap: prefs.spacing === 'wide' ? 24 : 14, padding: 16 }}>
        {COURSES_SUMMARY.map((course) => (
          /* 🌟 MUTADO PARA PRESSABLE: Ao tocar, ele chama a função de redirecionamento */
          <Pressable 
            key={course.id} 
            onPress={() => onSelectCourse(course.id)}
            style={({ pressed }) => [
              styles.card, 
              { 
                backgroundColor: theme.card, 
                borderColor: theme.borderColor, 
                padding: prefs.spacing === 'wide' ? 24 : 16,
                opacity: pressed ? 0.8 : 1
              }
            ]}
          >
            <Text style={[styles.cardTitle, { fontSize: getFontSize('title'), color: theme.text }]}>
              {course.title}
            </Text>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBarOuter, { backgroundColor: theme.progressBarBg }]}>
                <View style={[styles.progressBarInner, { width: `${course.progress}%`, backgroundColor: theme.progressBarFill }]} />
              </View>
              <Text style={[styles.progressText, { fontSize: getFontSize('body') - 2, color: theme.text, fontWeight: 'bold' }]}>
                {course.progress}% Concluído ({course.completedTasks}/{course.totalTasks})
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: getFontSize('body') - 2, marginTop: 4, fontStyle: 'italic' }}>
                Clique para abrir as tarefas de hoje ➔
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 2 },
  title: { fontWeight: '900' },
  card: { borderRadius: 16, borderWidth: 3, gap: 12, elevation: 1 },
  cardTitle: { fontWeight: 'bold' },
  progressContainer: { marginTop: 4, gap: 6 },
  progressBarOuter: { height: 16, borderRadius: 8, overflow: 'hidden', width: '100%' },
  progressBarInner: { height: '100%' },
  progressText: { marginTop: 2 }
});