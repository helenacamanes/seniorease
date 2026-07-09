import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import TasksScreen from '../screens/TasksScreen';
import DashboardScreen from '../screens/DashboardScreen'; 
import AccessibilityPanelScreen from '../screens/AccessibilityPanelScreen'; 

export default function MainTabNavigator() {
  const { prefs } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<'courses' | 'tasks' | 'settings'>('courses');
  
  // 🌟 NOVO: Estado para saber se há um curso filtrado vindo da Dashboard
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const getTabFontSize = () => {
    if (prefs.fontSize === 'extra-large') return 18;
    if (prefs.fontSize === 'large') return 16;
    return 13;
  };

  const theme = {
    navBg: prefs.highContrast ? '#000000' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#cbd5e1',
    activeText: prefs.highContrast ? '#facc15' : '#1e40af',
    inactiveText: prefs.highContrast ? '#888888' : '#64748b',
    activeBg: prefs.highContrast ? '#222222' : '#f1f5f9',
  };

  // Função para a Dashboard chamar ao clicar em um curso
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId); // Define o filtro do curso
    setCurrentTab('tasks');        // Chaveia automaticamente para a aba de tarefas
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'courses': 
        return <DashboardScreen onSelectCourse={handleSelectCourse} />;
      case 'tasks': 
        return (
          <TasksScreen 
            activeCourseFilter={selectedCourseId} 
            onClearFilter={() => setSelectedCourseId(null)} 
          />
        );
      case 'settings': 
        return <AccessibilityPanelScreen />;
      default: 
        return <DashboardScreen onSelectCourse={handleSelectCourse} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      {/* 🧭 NAV BAR */}
      <View 
        style={[
          styles.tabBar, 
          { 
            backgroundColor: theme.navBg, 
            borderTopColor: theme.border,
            height: prefs.spacing === 'wide' ? 95 : 80 
          }
        ]}
      >
        <Pressable
          onPress={() => {
            setSelectedCourseId(null); // Ao clicar direto na aba Cursos, limpa filtros antigos
            setCurrentTab('courses');
          }}
          style={[styles.tabItem, currentTab === 'courses' && { backgroundColor: theme.activeBg }]}
        >
          <Text style={{ fontSize: prefs.fontSize === 'extra-large' ? 28 : 24 }}>🎓</Text>
          <Text style={[styles.tabLabel, { fontSize: getTabFontSize(), color: currentTab === 'courses' ? theme.activeText : theme.inactiveText }]}>
            Cursos
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setCurrentTab('tasks')}
          style={[styles.tabItem, currentTab === 'tasks' && { backgroundColor: theme.activeBg }]}
        >
          <Text style={{ fontSize: prefs.fontSize === 'extra-large' ? 28 : 24 }}>📋</Text>
          <Text style={[styles.tabLabel, { fontSize: getTabFontSize(), color: currentTab === 'tasks' ? theme.activeText : theme.inactiveText }]}>
            Tarefas
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setCurrentTab('settings')}
          style={[styles.tabItem, currentTab === 'settings' && { backgroundColor: theme.activeBg }]}
        >
          <Text style={{ fontSize: prefs.fontSize === 'extra-large' ? 28 : 24 }}>⚙️</Text>
          <Text style={[styles.tabLabel, { fontSize: getTabFontSize(), color: currentTab === 'settings' ? theme.activeText : theme.inactiveText }]}>
            Ajustes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: 3, justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  tabItem: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontWeight: 'bold', marginTop: 2 },
});