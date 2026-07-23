import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AccessibleButton } from './AccessibleButton';

export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  spacing: 'normal' | 'wide';
  highContrast: boolean;
  extraConfirmation?: boolean;
  simplifiedMode?: boolean;
  reminderFrequency?: 'none' | 'daily' | 'weekly';
  enhancedFeedback?: boolean;
  reduceMotion?: boolean;
}

export interface AccessibilityPanelProps {
  prefs: AccessibilityPreferences;
  onChange: (prefs: AccessibilityPreferences) => void;
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

  const handleReminderChange = (
    frequency: 'none' | 'daily' | 'weekly'
  ) => {
    onChange({
      ...prefs,
      reminderFrequency: frequency,
    });
    if (typeof window !== 'undefined' && 'Notification' in window && frequency !== 'none') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
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

      {/* 4. ANIMAÇÕES E MOVIMENTOS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Animações e Movimentos:
        </Text>
        <View style={{ gap: 10 }}>
          <AccessibleButton
            title={prefs.reduceMotion ? '🎬 Reduzir Animações (Ativo)' : '🎬 Reduzir Animações / Movimentos'}
            onPress={() => onChange({ ...prefs, reduceMotion: !prefs.reduceMotion })}
            variant={prefs.reduceMotion ? 'primary' : 'secondary'}
          />
        </View>
      </View>

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
          <AccessibleButton
            title={prefs.enhancedFeedback ? '🎉 Feedback Visual Reforçado Ligado' : '🎉 Ativar Feedback Visual Reforçado'}
            onPress={() => onChange({ ...prefs, enhancedFeedback: !prefs.enhancedFeedback })}
            variant={prefs.enhancedFeedback ? 'primary' : 'secondary'}
          />
        </View>
      </View>

      {/* 6. LEMBRETES DE ESTUDO */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: getFontSize(), color: theme.text }]}>
          Lembretes de Estudo:
        </Text>
        <View style={{ gap: 10 }}>
          <AccessibleButton
            title="Não avisar"
            onPress={() => handleReminderChange('none')}
            variant={prefs.reminderFrequency === 'none' ? 'primary' : 'secondary'}
          />
          <AccessibleButton
            title="Avisar Todo Dia 📅"
            onPress={() => handleReminderChange('daily')}
            variant={prefs.reminderFrequency === 'daily' ? 'primary' : 'secondary'}
          />
          <AccessibleButton
            title="Avisar Toda Semana 🗓️"
            onPress={() => handleReminderChange('weekly')}
            variant={prefs.reminderFrequency === 'weekly' ? 'primary' : 'secondary'}
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
  row: { flexDirection: 'column', gap: 8 }
});