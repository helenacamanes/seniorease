import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import TasksScreen from '../screens/TasksScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AccessibilityPanelScreen from '../screens/AccessibilityPanelScreen';
import ProfileScreen from '../screens/ProfileScreen';

type TabKey = 'courses' | 'tasks' | 'history' | 'settings' | 'profile';

export default function MainTabNavigator() {
  const { prefs } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<TabKey>('tasks');

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

  const tabs: { key: TabKey; icon: string; label: string }[] = prefs.simplifiedMode
    ? [
      { key: 'tasks', icon: '📋', label: 'Tarefas' },
      { key: 'settings', icon: '⚙️', label: 'Ajustes' },
      { key: 'profile', icon: '👤', label: 'Perfil' }

    ]
    : [
      { key: 'tasks', icon: '📋', label: 'Tarefas' },
      { key: 'history', icon: '🗂️', label: 'Histórico' },
      { key: 'settings', icon: '⚙️', label: 'Ajustes' },
      { key: 'profile', icon: '👤', label: 'Perfil' }

    ];

  React.useEffect(() => {
    if (prefs.simplifiedMode && currentTab === 'courses') {
      setCurrentTab('tasks');
    }
  }, [prefs.simplifiedMode, currentTab]);

  const renderScreen = () => {
    switch (currentTab) {
      case 'courses':
        return <DashboardScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <AccessibilityPanelScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <TasksScreen />;
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
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setCurrentTab(tab.key)}
            style={[styles.tabItem, currentTab === tab.key && { backgroundColor: theme.activeBg }]}
          >
            <Text style={{ fontSize: prefs.fontSize === 'extra-large' ? 28 : 24 }}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, { fontSize: getTabFontSize(), color: currentTab === tab.key ? theme.activeText : theme.inactiveText }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
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
