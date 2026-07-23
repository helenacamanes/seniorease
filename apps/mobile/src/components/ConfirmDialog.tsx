import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Sim, confirmar',
  cancelLabel = 'Não, cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { prefs } = useAccessibility();

  const theme = {
    overlay: 'rgba(0,0,0,0.6)',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eeeeee' : '#64748b',
    cancelBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    cancelText: prefs.highContrast ? '#facc15' : '#334155',
    confirmBg: destructive ? (prefs.highContrast ? '#7f1d1d' : '#ef4444') : (prefs.highContrast ? '#facc15' : '#2563eb'),
    confirmText: destructive ? '#ffffff' : (prefs.highContrast ? '#000000' : '#ffffff'),
  };

  const getFontSize = (type: 'title' | 'body') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    return type === 'title' ? 22 + modifier : 18 + modifier;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textMuted, fontSize: getFontSize('body') }]}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.cancelBg, borderColor: theme.border, borderWidth: 2 }]}
            onPress={onCancel}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.cancelText, fontSize: getFontSize('body') }]}>{cancelLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.confirmBg }]}
            onPress={onConfirm}
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.confirmText, fontSize: getFontSize('body') }]}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: 24, borderWidth: 3, padding: 28, gap: 14 },
  title: { fontWeight: 'bold', textAlign: 'center' },
  message: { textAlign: 'center', lineHeight: 26, marginBottom: 8 },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  buttonText: { fontWeight: 'bold' },
});
