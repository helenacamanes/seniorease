import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibilityPanel } from '../components/AccessibilityPanel';

export default function AccessibilityPanelScreen() {
  const { prefs, updatePrefs } = useAccessibility();

  const getFontSize = () => {
    if (prefs.fontSize === 'large') return 26;
    if (prefs.fontSize === 'extra-large') return 30;
    return 22;
  };

  const theme = {
    container: prefs.highContrast ? '#000000' : '#f8fafc',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    border: prefs.highContrast ? '#facc15' : '#cbd5e1'
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.container }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { fontSize: getFontSize(), color: theme.text }]}>
          Ajustes de Tela ⚙️
        </Text>
        <Text style={{ color: theme.text, opacity: 0.8, fontSize: getFontSize() - 6, marginTop: 4 }}>
          Personalize o aplicativo para ficar mais confortável para você.
        </Text>
      </View>

      <View style={styles.content}>
        {/* 🌟 REAPROVEITANDO SEU COMPONENTE AQUI: */}
        <AccessibilityPanel prefs={prefs} onChange={updatePrefs} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 40 }
});