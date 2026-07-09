import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AccessibilityPreferences } from '../context/AccessibilityContext';
import { AccessibleButton } from './AccessibleButton';

interface AccessibilityPanelProps {
  prefs: AccessibilityPreferences;
  onChange: (updatedPrefs: AccessibilityPreferences) => void;
}

export function AccessibilityPanel({ prefs, onChange }: AccessibilityPanelProps) {
  
  const getFontSize = () => {
    if (prefs.fontSize === 'large') return 20;
    if (prefs.fontSize === 'extra-large') return 24;
    return 16;
  };

  const theme = {
    text: prefs.highContrast ? '#facc15' : '#1e293b',
  };

  return (
    <View style={[styles.container, { gap: prefs.spacing === 'wide' ? 24 : 16 }]}>
      
      {/* 1. TAMANHO DA LETRA */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Tamanho da Letra:
        </Text>
        <View style={styles.row}>
          <AccessibleButton 
            title="Normal" 
            onPress={() => onChange({ ...prefs, fontSize: 'normal' })}
            variant={prefs.fontSize === 'normal' ? 'primary' : 'secondary'}
          />
          <AccessibleButton 
            title="Grande" 
            onPress={() => onChange({ ...prefs, fontSize: 'large' })}
            variant={prefs.fontSize === 'large' ? 'primary' : 'secondary'}
          />
          <AccessibleButton 
            title="Muito Grande" 
            onPress={() => onChange({ ...prefs, fontSize: 'extra-large' })}
            variant={prefs.fontSize === 'extra-large' ? 'primary' : 'secondary'}
          />
        </View>
      </View>

      {/* 2. CORES DA TELA */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Cores da Tela:
        </Text>
        <View style={styles.row}>
          <AccessibleButton 
            title="🎨 Cores Normais" 
            onPress={() => onChange({ ...prefs, highContrast: false })}
            variant={!prefs.highContrast ? 'primary' : 'secondary'}
          />
          <AccessibleButton 
            title="⚫ Alto Contraste" 
            onPress={() => onChange({ ...prefs, highContrast: true })}
            variant={prefs.highContrast ? 'primary' : 'secondary'}
          />
        </View>
      </View>

      {/* 3. ESPAÇAMENTO */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Espaço entre Botões:
        </Text>
        <View style={styles.row}>
          <AccessibleButton 
            title="Normal" 
            onPress={() => onChange({ ...prefs, spacing: 'normal' })}
            variant={prefs.spacing === 'normal' ? 'primary' : 'secondary'}
          />
          <AccessibleButton 
            title="Mais Espaço" 
            onPress={() => onChange({ ...prefs, spacing: 'wide' })}
            variant={prefs.spacing === 'wide' ? 'primary' : 'secondary'}
          />
        </View>
      </View>

      {/* 4. MODO SIMPLIFICADO E SEGURANÇA */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Navegação e Segurança:
        </Text>
        <View style={{ gap: 10 }}>
          <AccessibleButton 
            title={prefs.simplifiedMode ? '✨ Modo Simplificado Ativo' : '✨ Ativar Modo Simplificado'} 
            onPress={() => onChange({ ...prefs, simplifiedMode: !prefs.simplifiedMode })}
            variant={prefs.simplifiedMode ? 'primary' : 'secondary'}
          />
          <AccessibleButton 
            title={prefs.extraConfirmation ? '🔒 Avisos de Segurança Ativos' : '🔒 Ativar Avisos de Segurança'} 
            onPress={() => onChange({ ...prefs, extraConfirmation: !prefs.extraConfirmation })}
            variant={prefs.extraConfirmation ? 'primary' : 'secondary'}
          />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  section: { gap: 8 },
  sectionTitle: { fontWeight: 'bold' },
  row: { flexDirection: 'column', gap: 8 } // No mobile, empilhar os botões é melhor para o dedo do idoso não errar o clique!
});