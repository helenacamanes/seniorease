import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibleButton } from './AccessibleButton';

interface GuidedTaskModalProps {
  task: { title: string; steps: string[] };
  onClose: () => void;
  onComplete: () => void;
}

export function GuidedTaskModal({ task, onClose, onComplete }: GuidedTaskModalProps) {
  const { prefs } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    if (type === 'title') return isExtra ? 26 : isLarge ? 22 : 18;
    return isExtra ? 22 : isLarge ? 19 : 16;
  };

  const theme = {
    card: prefs.highContrast ? '#000000' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    stepBg: prefs.highContrast ? '#121212' : '#f1f5f9',
  };

  const isLastStep = currentStep === task.steps.length - 1;

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
          
          <View style={styles.header}>
            <Text style={[styles.taskTitle, { fontSize: getFontSize('title'), color: theme.text }]}>
              {task.title}
            </Text>
            <Text style={[styles.progressText, { fontSize: getFontSize('body'), color: theme.text }]}>
              Passo {currentStep + 1} de {task.steps.length}
            </Text>
          </View>

          <View style={[styles.stepBox, { backgroundColor: theme.stepBg, padding: prefs.spacing === 'wide' ? 24 : 16 }]}>
            <Text style={[styles.stepText, { fontSize: getFontSize('body') + 2, color: theme.text }]}>
              {task.steps[currentStep]}
            </Text>
          </View>

          <View style={{ gap: 12, width: '100%' }}>
            {isLastStep ? (
              <AccessibleButton title="✨ Concluir Atividade!" onPress={onComplete} />
            ) : (
              <AccessibleButton title="Avançar Passo ➔" onPress={() => setCurrentStep(prev => prev + 1)} />
            )}

            {currentStep > 0 && (
              <AccessibleButton title="⬅️ Passo Anterior" onPress={() => setCurrentStep(prev => prev - 1)} variant="secondary" />
            )}

            <AccessibleButton title="Parar e Sair" onPress={onClose} variant="secondary" />
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 450, borderRadius: 24, borderWidth: 3, padding: 20, gap: 16 },
  header: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 10 },
  taskTitle: { fontWeight: 'bold', textAlign: 'center' },
  progressText: { fontWeight: 'bold', marginTop: 4, opacity: 0.8 },
  stepBox: { width: '100%', borderRadius: 16, justifyContent: 'center', minHeight: 120 },
  stepText: { textAlign: 'center', fontWeight: '500', lineHeight: 28 },
});