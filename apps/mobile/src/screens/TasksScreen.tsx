import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

const INITIAL_TASKS = [
  { id: 't1', courseId: 'curso-ti', courseName: '💻 Celular e Internet', title: 'Assistir: Como enviar mensagens no WhatsApp', completed: false, description: 'Um vídeo curto de 3 minutos explicando o passo a passo para mandar mensagens e áudios para seus amigos e familiares.' },
  { id: 't2', courseId: 'curso-ti', courseName: '💻 Celular e Internet', title: 'Prática: Enviar uma foto para um contato', completed: true, description: 'Abra o seu aplicativo de mensagens e treine o envio de uma foto da sua galeria.' },
  { id: 't3', courseId: 'curso-financas', courseName: '💰 Finanças Pessoais', title: 'Assistir: O que é o PIX e como ele funciona?', completed: false, description: 'Entenda de forma simples e segura como fazer e receber transferências instantâneas pelo banco.' }
];

interface TasksScreenProps {
  activeCourseFilter: string | null;
  onClearFilter: () => void;
}

export default function TasksScreen({ activeCourseFilter, onClearFilter }: TasksScreenProps) {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<typeof INITIAL_TASKS[0] | null>(null);

  const getFontSize = (type: 'title' | 'body') => {
    const isLarge = prefs.fontSize === 'large';
    const isExtra = prefs.fontSize === 'extra-large';
    return type === 'title' ? (isExtra ? 26 : isLarge ? 22 : 18) : (isExtra ? 20 : isLarge ? 17 : 14);
  };

  const theme = {
    container: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    borderColor: prefs.highContrast ? '#facc15' : '#e2e8f0',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    textMuted: prefs.highContrast ? '#eab308' : '#64748b',
    headerText: prefs.highContrast ? '#ffffff' : '#0f172a',
    buttonActiveBg: prefs.highContrast ? '#16a34a' : '#22c55e',
    buttonActiveText: '#ffffff',
    buttonClearBg: prefs.highContrast ? '#222222' : '#f1f5f9',
    buttonClearText: prefs.highContrast ? '#facc15' : '#334155',
  };

  // 🌟 FILTRAGEM DINÂMICA: Filtra por curso se houver um id ativo
  const filteredTasks = activeCourseFilter
    ? tasks.filter(t => t.courseId === activeCourseFilter)
    : tasks;

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const finishedTasks = filteredTasks.filter(t => t.completed);

  // Captura o nome amigável do curso filtrado
  const currentCourseName = activeCourseFilter && filteredTasks.length > 0
    ? filteredTasks[0].courseName
    : '';

  const toggleTaskCompletion = (taskId: string, isCompleted: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !isCompleted } : t));

    // Se marcou como concluída, avisa de forma simples e motivadora
    if (!isCompleted) {
      Alert.alert('Parabéns! 🎉', 'Você completou mais uma atividade com sucesso!');
    }

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, completed: !isCompleted } : null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.container }]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {activeCourseFilter && (
          <View style={[styles.filterAlert, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
            <Text style={[styles.filterText, { fontSize: getFontSize('body'), color: theme.text }]}>
              Mostrando tarefas de: <Text style={{ fontWeight: '950' }}>{currentCourseName}</Text>
            </Text>
            <Pressable
              onPress={onClearFilter}
              style={[styles.clearFilterButton, { backgroundColor: theme.buttonClearBg, borderColor: theme.borderColor }]}
            >
              <Text style={[styles.clearFilterButtonText, { fontSize: getFontSize('body'), color: theme.buttonClearText }]}>
                📂 Mostrar todas as tarefas
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.sectionHeader, { fontSize: getFontSize('title'), color: theme.headerText }]}>
          ⏳ Atividades para Fazer ({activeTasks.length})
        </Text>

        {activeTasks.length === 0 ? (
          <Text style={[styles.emptyText, { fontSize: getFontSize('body'), color: theme.textMuted }]}>
            Não há tarefas pendentes aqui! Excelente trabalho. 👍
          </Text>
        ) : (
          activeTasks.map(task => (
            <Pressable
              key={task.id}
              onPress={() => setSelectedTask(task)}
              style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.borderColor, padding: prefs.spacing === 'wide' ? 20 : 14 }]}
            >
              <View style={styles.taskCardHeader}>
                <Text style={[styles.taskTitle, { fontSize: getFontSize('body') + 2, color: theme.text }]}>
                  {task.title}
                </Text>
                {!activeCourseFilter && (
                  <Text style={[styles.courseBadge, { fontSize: getFontSize('body') - 3, color: theme.textMuted }]}>
                    {task.courseName}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => toggleTaskCompletion(task.id, task.completed)}
                style={[styles.checkboxButton, { backgroundColor: theme.buttonClearBg, borderColor: theme.borderColor }]}
              >
                <Text style={{ fontSize: getFontSize('body') }}>⬜ Marcar como Feita</Text>
              </Pressable>
            </Pressable>
          ))
        )}

        <Text style={[styles.sectionHeader, { fontSize: getFontSize('title'), color: theme.headerText, marginTop: 16 }]}>
          ✅ Concluídas ({finishedTasks.length})
        </Text>

        {finishedTasks.map(task => (
          <Pressable
            key={task.id}
            onPress={() => setSelectedTask(task)}
            style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.borderColor, opacity: 0.8, padding: prefs.spacing === 'wide' ? 20 : 14 }]}
          >
            <View style={styles.taskCardHeader}>
              <Text style={[styles.taskTitle, { fontSize: getFontSize('body') + 2, color: theme.text, textDecorationLine: 'line-through' }]}>
                {task.title}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleTaskCompletion(task.id, task.completed)}
              style={[styles.checkboxButton, { backgroundColor: theme.buttonActiveBg, borderColor: theme.borderColor }]}
            >
              <Text style={{ fontSize: getFontSize('body'), color: theme.buttonActiveText, fontWeight: 'bold' }}>
                💚 Atividade Concluída! (Refazer)
              </Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>

      {selectedTask && (
        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}> <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.borderColor, padding: prefs.spacing === 'wide' ? 28 : 20 }]}>
          <Text style={[styles.modalCourse, { fontSize: getFontSize('body') - 2, color: theme.textMuted }]}>
            {selectedTask.courseName}
          </Text>
          <Text style={[styles.modalTitle, { fontSize: getFontSize('title'), color: theme.text }]}>
            {selectedTask.title}
          </Text>

          <ScrollView style={styles.modalDescriptionContainer}>
            <Text style={[styles.modalDescription, { fontSize: getFontSize('body') + 2, color: theme.text }]}>
              {selectedTask.description}
            </Text>
          </ScrollView>

          <View style={{ gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={() => toggleTaskCompletion(selectedTask.id, selectedTask.completed)}
              style={[styles.modalActionButton, { backgroundColor: selectedTask.completed ? theme.buttonClearBg : theme.buttonActiveBg }]}
            >
              <Text style={{ fontSize: getFontSize('body'), fontWeight: 'bold', color: selectedTask.completed ? theme.buttonClearText : theme.buttonActiveText, textAlign: 'center' }}>
                {selectedTask.completed ? '↩️ Mudar para Não Feita' : '✔️ Concluir esta Atividade'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedTask(null)}
              style={[styles.modalCloseButton, { borderColor: theme.borderColor }]}
            >
              <Text style={{ fontSize: getFontSize('body'), color: theme.text, textAlign: 'center', fontWeight: 'bold' }}>
                Fechar Detalhes
              </Text>
            </Pressable>
          </View>
        </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterAlert: { borderRadius: 16, borderWidth: 3, padding: 16, gap: 12, elevation: 2 },
  filterText: { lineHeight: 26 },
  clearFilterButton: { padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  clearFilterButtonText: { fontWeight: 'bold' },
  sectionHeader: { fontWeight: '900', marginVertical: 6 },
  emptyText: { fontStyle: 'italic', paddingLeft: 4 },
  taskCard: { borderRadius: 16, borderWidth: 3, gap: 12, elevation: 1 },
  taskCardHeader: { gap: 4 },
  taskTitle: { fontWeight: 'bold', lineHeight: 26 },
  courseBadge: { fontWeight: 'bold' },
  checkboxButton: { padding: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  modalOverlay: { justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', maxHeight: '80%', borderRadius: 24, borderWidth: 4, gap: 14, elevation: 10 },
  modalCourse: { fontWeight: 'bold', textTransform: 'uppercase' },
  modalTitle: { fontWeight: '900', lineHeight: 32 },
  modalDescriptionContainer: { maxHeight: 180, marginVertical: 6 },
  modalDescription: { lineHeight: 28 },
  modalActionButton: { padding: 16, borderRadius: 12, justifyContent: 'center' },
  modalCloseButton: { padding: 14, borderRadius: 12, borderWidth: 2, justifyContent: 'center' }
});