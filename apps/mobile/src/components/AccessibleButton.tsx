import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function AccessibleButton({ title, onPress, variant = 'primary' }: AccessibleButtonProps) {
  const { prefs } = useAccessibility();

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
    headerBorder: prefs.highContrast ? '#facc15' : '#e2e8f0',
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => {
        const baseStyle: ViewStyle[] = [styles.button];

        // Espaçamento dinâmico
        baseStyle.push({
          paddingVertical: prefs.spacing === 'wide' ? 20 : 14,
          paddingHorizontal: prefs.spacing === 'wide' ? 24 : 16,
        });

        // Cores e Alto Contraste
        if (prefs.highContrast) {
          baseStyle.push({
            backgroundColor: pressed ? '#222' : '#000',
            borderColor: '#facc15',
            borderWidth: 3,
          });
        } else {
          baseStyle.push({
            backgroundColor: variant === 'primary' ? (pressed ? '#0f172a' : '#1e293b') : (pressed ? '#e2e8f0' : '#ffffff'),
            borderColor: variant === 'primary' ? '#0f172a' : '#cbd5e1',
            borderWidth: 1,
          });
        }

        // 🌟 RESPOSTA VISUAL REAL: Afunda o botão ao tocar
        if (pressed) {
          baseStyle.push({ transform: [{ scale: 0.96 }] });
        }

        return baseStyle;
      }}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: getFontSize('title'),
            color: prefs.highContrast ? '#facc15' : variant === 'primary' ? '#fff' : '#334155',
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
  },
  text: { fontWeight: 'bold', textAlign: 'center' },
});