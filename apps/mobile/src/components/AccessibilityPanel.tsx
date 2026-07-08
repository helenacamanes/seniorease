import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
  simplifiedMode: boolean;
  extraConfirmation: boolean;
}

interface AccessibilityPanelProps {
  prefs: AccessibilityPreferences;
  onChange: (updatedPrefs: AccessibilityPreferences) => void;
}

export  function AccessibilityPanel({ prefs, onChange }: AccessibilityPanelProps) {
  
  const updatePref = (key: keyof AccessibilityPreferences, value: any) => {
    onChange({ ...prefs, [key]: value });
  };

  // Mapeamento dinâmico de texto para o Mobile
  const getFontSize = () => {
    if (prefs.fontSize === 'extra-large') return 24;
    if (prefs.fontSize === 'large') return 20;
    return 16;
  };

  const theme = {
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    border: prefs.highContrast ? '#ffff00' : '#e2e8f0',
    btnActive: prefs.highContrast ? '#ffff00' : '#2563eb',
    btnActiveText: prefs.highContrast ? '#000000' : '#ffffff',
    btnInactive: prefs.highContrast ? '#000000' : '#f1f5f9',
    btnInactiveText: prefs.highContrast ? '#ffff00' : '#334155',
  };

  const spacingGap = prefs.spacing === 'wide' ? 24 : 14;

  return (
    <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border, gap: spacingGap }]}>
      
      <Text style={[styles.panelTitle, { color: theme.text, fontSize: getFontSize() + 4 }]}>
        ⚙️ Ajustes Visuais e de Toque
      </Text>

      {/* 1. TAMANHO DA FONTE */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text, fontSize: getFontSize() }]}>1. Tamanho do Texto:</Text>
        <View style={styles.row}>
          {(['normal', 'large', 'extra-large'] as const).map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.btn, { 
                backgroundColor: prefs.fontSize === size ? theme.btnActive : theme.btnInactive,
                borderColor: theme.border
              }]}
              onPress={() => updatePref('fontSize', size)}
            >
              <Text style={{ 
                color: prefs.fontSize === size ? theme.btnActiveText : theme.btnInactiveText,
                fontWeight: 'bold',
                fontSize: size === 'normal' ? 14 : size === 'large' ? 17 : 20
              }}>
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. ESPAÇAMENTO */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text, fontSize: getFontSize() }]}>2. Espaço de Toque:</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: prefs.spacing === 'normal' ? theme.btnActive : theme.btnInactive, borderColor: theme.border }]}
            onPress={() => updatePref('spacing', 'normal')}
          >
            <Text style={{ color: prefs.spacing === 'normal' ? theme.btnActiveText : theme.btnInactiveText, fontWeight: 'bold', fontSize: getFontSize() }}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: prefs.spacing === 'wide' ? theme.btnActive : theme.btnInactive, borderColor: theme.border }]}
            onPress={() => updatePref('spacing', 'wide')}
          >
            <Text style={{ color: prefs.spacing === 'wide' ? theme.btnActiveText : theme.btnInactiveText, fontWeight: 'bold', fontSize: getFontSize() }}>↔️ Maior</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. ALTO CONTRASTE */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text, fontSize: getFontSize() }]}>3. Cores:</Text>
        <TouchableOpacity
          style={[styles.fullBtn, { backgroundColor: prefs.highContrast ? '#ffff00' : '#1e293b' }]}
          onPress={() => updatePref('highContrast', !prefs.highContrast)}
        >
          <Text style={{ color: prefs.highContrast ? '#000000' : '#ffffff', fontWeight: 'bold', fontSize: getFontSize() }}>
            {prefs.highContrast ? '⚫ Alto Contraste Ativo' : '⚪ Cores Padrão'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. MODALIDADE SIMPLIFICADA */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text, fontSize: getFontSize() }]}>4. Modo do Aplicativo:</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: !prefs.simplifiedMode ? theme.btnActive : theme.btnInactive, borderColor: theme.border }]}
            onPress={() => updatePref('simplifiedMode', false)}
          >
            <Text style={{ color: !prefs.simplifiedMode ? theme.btnActiveText : theme.btnInactiveText, fontWeight: 'bold', fontSize: getFontSize() }}>Padrão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: prefs.simplifiedMode ? theme.btnActive : theme.btnInactive, borderColor: theme.border }]}
            onPress={() => updatePref('simplifiedMode', true)}
          >
            <Text style={{ color: prefs.simplifiedMode ? theme.btnActiveText : theme.btnInactiveText, fontWeight: 'bold', fontSize: getFontSize() }}>⭐ Simples</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. CONFIRMAÇÃO CRÍTICA */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text, fontSize: getFontSize() }]}>5. Confirmações de Cliques:</Text>
        <TouchableOpacity
          style={[styles.fullBtn, { backgroundColor: prefs.extraConfirmation ? theme.btnActive : theme.btnInactive, borderWidth: 2, borderColor: theme.border }]}
          onPress={() => updatePref('extraConfirmation', !prefs.extraConfirmation)}
        >
          <Text style={{ color: prefs.extraConfirmation ? theme.btnActiveText : theme.btnInactiveText, fontWeight: 'bold', fontSize: getFontSize() }}>
            {prefs.extraConfirmation ? '🔒 Ativado (Mais Seguro)' : '🔓 Desativado'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 20, borderRadius: 16, borderWidth: 3 },
  panelTitle: { fontWeight: 'bold', textAlign: 'center', marginBottom: 6, borderBottomWidth: 1, paddingBottom: 8, borderBottomColor: '#cbd5e1' },
  section: { flexDirection: 'column', gap: 6 },
  label: { fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  fullBtn: { width: '100%', minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }
});