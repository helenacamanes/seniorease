import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface SuccessFeedbackProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

// 🌟 "Ativação de feedback visual reforçado" pedido no briefing.
// Quando `enhancedFeedback` está ligado, esta tela some por cima de tudo
// com um ícone grande, cor de sucesso e uma animação simples — reforço
// bem mais visível do que só um texto de aviso.
export function SuccessFeedback({ visible, message, onDismiss }: SuccessFeedbackProps) {
  const { prefs } = useAccessibility();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0);
    opacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [visible]);

  if (!visible) return null;

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#16a34a',
    text: prefs.highContrast ? '#facc15' : '#ffffff',
    iconBg: prefs.highContrast ? '#facc15' : '#ffffff',
    iconColor: prefs.highContrast ? '#000000' : '#16a34a',
  };

  const getFontSize = () => {
    if (prefs.fontSize === 'extra-large') return 26;
    if (prefs.fontSize === 'large') return 22;
    return 19;
  };

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.bg,
            opacity,
            transform: [{ scale }],
            borderWidth: prefs.highContrast ? 3 : 0,
            borderColor: '#facc15',
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: theme.iconBg }]}>
          <Text style={[styles.iconText, { color: theme.iconColor }]}>✓</Text>
        </View>
        <Text style={[styles.message, { color: theme.text, fontSize: getFontSize() }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
    maxWidth: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  message: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
