import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../lib/firebase'; // 🌟 Importa o db e auth locais do mobile
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Header } from '../components/Header';
import { GuidedTaskModal } from '../components/GuidedTaskModal';
import { SuccessFeedback } from '../components/SuccessFeedback';
import { GetGuidedSteps, Task } from '@seniorease/domain';

export default function TasksScreen() {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [guidedTask, setGuidedTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // 🌟 Modo Simplificado: começa escondendo as tarefas já concluídas,
  // para reduzir a quantidade de informação na tela.
  const [showCompleted, setShowCompleted] = useState(!prefs.simplifiedMode);

  const userId = auth.currentUser?.uid;

  const getFontSize = (type: 'title' | 'body' | 'button') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    if (type === 'title') return 24 + modifier;
    if (type === 'button') return 18 + modifier;
    return 20 + modifier;
  };

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    textMuted: prefs.highContrast ? '#ffffff' : '#64748b',
    border: prefs.highContrast ? '#ffff00' : '#cbd5e1',
    btnPending: prefs.highContrast ? '#000000' : '#2563eb',
    btnCompleted: prefs.highContrast ? '#333333' : '#16a34a',
    btnText: prefs.highContrast ? '#ffff00' : '#ffffff',
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', userId, 'tasks');

    // Escuta o banco de dados em tempo real. Se mudar na Web, muda no Mobile na hora!
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasksList: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasksList.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      setTasks(tasksList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar tarefas no mobile:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const performToggle = async (taskId: string, currentStatus: boolean) => {
    if (!userId) return;

    try {
      const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        completed: !currentStatus,
        // 🌟 Guarda quando a tarefa foi concluída, usado no Histórico.
        // Ao "desfazer", limpamos a data para não aparecer no histórico.
        completedAt: !currentStatus ? new Date().toISOString() : null,
      });

      if (!currentStatus) {
        // 🌟 Feedback Visual Reforçado: quando ligado, mostra um overlay
        // animado em vez de só um alerta de texto simples.
        if (prefs.enhancedFeedback) {
          setSuccessMessage('Muito bem! Atividade concluída!');
        } else {
          Alert.alert("Muito bem! 🎉", "Você concluiu mais uma atividade com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao alterar status da tarefa:", error);
      Alert.alert("Ops!", "Não foi possível salvar o seu progresso. Verifique sua internet.");
    }
  };

  const handleToggleTask = (taskId: string, currentStatus: boolean) => {
    // 🌟 Confirmação adicional antes de ação crítica: desfazer uma atividade
    // já concluída apaga o registro dela do Histórico, então avisamos antes.
    if (currentStatus && prefs.extraConfirmation) {
      Alert.alert(
        'Desfazer atividade concluída?',
        'Essa atividade vai voltar para "pendente" e sair do seu Histórico. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, desfazer', style: 'destructive', onPress: () => performToggle(taskId, currentStatus) },
        ]
      );
      return;
    }
    performToggle(taskId, currentStatus);
  };

  const openGuidedFlow = (task: Task) => {
    if (task.completed) return; // fluxo guiado só faz sentido para quem ainda vai fazer a tarefa
    setGuidedTask(task);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={prefs.highContrast ? '#ffff00' : '#2563eb'} />
        <Text style={{ fontSize: getFontSize('body'), marginTop: 10, color: theme.text }}>Buscando suas atividades...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title="Minhas Atividades 📋" />

      <View style={{ padding: prefs.spacing === 'wide' ? 24 : 16, flex: 1 }}>
        {tasks.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: getFontSize('body'), textAlign: 'center', color: theme.text }}>
              Nenhuma tarefa encontrada para o seu curso.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingTasks}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: prefs.spacing === 'wide' ? 16 : 8 }} />}
            ListEmptyComponent={
              <Text style={{ fontSize: getFontSize('body'), color: theme.textMuted, fontStyle: 'italic' }}>
                Nenhuma tarefa pendente! Excelente. 🎉
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openGuidedFlow(item)}
                style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border, padding: prefs.spacing === 'wide' ? 24 : 20 }]}
              >
                <Text style={[styles.taskTitle, { fontSize: getFontSize('body'), color: theme.text }]}>
                  {item.title}
                </Text>
                {/* 🌟 Modo Simplificado: esconde a categoria para reduzir informação na tela */}
                {!prefs.simplifiedMode && item.category && (
                  <Text style={{ fontSize: getFontSize('body') - 4, color: theme.textMuted, marginBottom: 12 }}>
                    {item.category}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.btnPending }]}
                  onPress={() => handleToggleTask(item.id, item.completed)}
                  accessibilityRole="button"
                  accessibilityLabel={`Marcar ${item.title} como concluída`}
                >
                  <Text style={[styles.btnText, { fontSize: getFontSize('button'), color: theme.btnText }]}>
                    Marcar como Pronto
                  </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: getFontSize('body') - 5, color: theme.textMuted, textAlign: 'center', marginTop: 8 }}>
                  Toque na atividade para ver o passo a passo
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              completedTasks.length > 0 ? (
                <View style={{ marginTop: prefs.spacing === 'wide' ? 24 : 16 }}>
                  <TouchableOpacity
                    onPress={() => setShowCompleted((prev) => !prev)}
                    style={[styles.toggleCompletedBtn, { borderColor: theme.border }]}
                    accessibilityRole="button"
                  >
                    <Text style={{ fontSize: getFontSize('body') - 2, color: theme.text, fontWeight: 'bold' }}>
                      {showCompleted ? '🔽' : '▶️'} Concluídas ({completedTasks.length})
                    </Text>
                  </TouchableOpacity>

                  {showCompleted && completedTasks.map((item) => (
                    <View key={item.id} style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border, padding: prefs.spacing === 'wide' ? 24 : 20, marginTop: 12, opacity: 0.75 }]}>
                      <Text style={[styles.taskTitle, { fontSize: getFontSize('body'), color: theme.text, textDecorationLine: 'line-through' }]}>
                        {item.title}
                      </Text>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.btnCompleted }]}
                        onPress={() => handleToggleTask(item.id, item.completed)}
                        accessibilityRole="button"
                        accessibilityLabel={`Marcar ${item.title} como não concluída`}
                      >
                        <Text style={[styles.btnText, { fontSize: getFontSize('button'), color: theme.btnText }]}>
                          ✓ Concluído (toque para desfazer)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* 🌟 FLUXO GUIADO PASSO A PASSO */}
      {guidedTask && (
        <GuidedTaskModal
          task={{ title: guidedTask.title, steps: GetGuidedSteps.execute(guidedTask) }}
          onClose={() => setGuidedTask(null)}
          onComplete={() => {
            handleToggleTask(guidedTask.id, guidedTask.completed);
            setGuidedTask(null);
          }}
        />
      )}

      {/* 🌟 FEEDBACK VISUAL REFORÇADO */}
      <SuccessFeedback
        visible={!!successMessage}
        message={successMessage || ''}
        onDismiss={() => setSuccessMessage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  taskCard: {
    borderWidth: 2,
    borderRadius: 16,
    elevation: 2
  },
  taskTitle: { marginBottom: 8, fontWeight: '500', lineHeight: 28 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52
  },
  btnText: { fontWeight: 'bold' },
  toggleCompletedBtn: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
});
