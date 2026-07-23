import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Header } from '../components/Header';
import { GuidedTaskModal } from '../components/GuidedTaskModal';
import { SuccessFeedback } from '../components/SuccessFeedback';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { GetGuidedSteps, Task } from '@seniorease/domain';


export default function TasksScreen() {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [guidedTask, setGuidedTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [taskPendingUndo, setTaskPendingUndo] = useState<Task | null>(null);
  const [taskPendingComplete, setTaskPendingComplete] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(!prefs.simplifiedMode);
  useEffect(() => {
    setShowCompleted(!prefs.simplifiedMode);
  }, [prefs.simplifiedMode]);
  const userId = auth.currentUser?.uid;
  const [showLeaveGuide, setShowLeaveGuide] =
    useState(false);

  const getFontSize = (baseSize: number | 'body' | 'button') => {
    const sizeMap: Record<'body' | 'button', number> = {
      body: 16,
      button: 15,
    };
    const resolvedSize = typeof baseSize === 'number' ? baseSize : sizeMap[baseSize];

    switch (prefs.fontSize) {
      case 'large':
        return resolvedSize * 1.25;
      case 'extra-large':
        return resolvedSize * 1.5;
      default:
        return resolvedSize;
    }
  };
  const getSpacing = (baseSpacing: number) => {
    return prefs.spacing === 'wide' ? baseSpacing * 1.5 : baseSpacing;
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
        completedAt: !currentStatus ? new Date().toISOString() : null,
      });

      if (!currentStatus) {
        if (prefs.enhancedFeedback) {
          setSuccessMessage('Muito bem! Atividade concluída!');
        } else {
          Alert.alert("Muito bem! 🎉", "Você concluiu mais uma atividade com sucesso!");
        }
      } else {
        Alert.alert("Atividade retornada para a lista de pendentes.");
      }
    } catch (error) {
      console.error("Erro ao alterar status da tarefa:", error);
      Alert.alert("Ops!", "Não foi possível salvar o seu progresso. Verifique sua internet.");
    }
  };

  const handleToggleTask = (taskId: string, currentStatus: boolean) => {
    const task = tasks.find((t) => t.id === taskId) || null;

    if (prefs.extraConfirmation) {
      if (currentStatus) {
        setTaskPendingUndo(task);
        Alert.alert("Confirme se deseja desfazer esta atividade.");
      } else {
        setTaskPendingComplete(task);
        Alert.alert("Confirme se deseja concluir esta atividade.");
      }
      return;
    }

    performToggle(taskId, currentStatus);
  };

  const openGuidedFlow = (task: Task) => {
    if (task.completed) return;
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
                activeOpacity={prefs.reduceMotion ? 1 : 0.8}
                onPress={() => openGuidedFlow(item)}
                style={[
                  styles.taskCard,
                  { backgroundColor: theme.card, borderColor: theme.border, padding: prefs.spacing === 'wide' ? 24 : 20 }
                ]}
              >
                <Text style={[styles.taskTitle, { fontSize: getFontSize('body'), color: theme.text }]}>
                  {item.title}
                </Text>
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
              completedTasks.length > 0 &&
                !prefs.simplifiedMode ? (
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

      {/* FLUXO GUIADO PASSO A PASSO */}
      {guidedTask && (
        <GuidedTaskModal
          task={{ title: guidedTask.title, steps: GetGuidedSteps.execute(guidedTask) }}
          onClose={() => {
            if (prefs.extraConfirmation) {
              setShowLeaveGuide(true);
              return;
            }

            setGuidedTask(null);
          }}
          onComplete={() => {
            handleToggleTask(guidedTask.id, guidedTask.completed);
            setGuidedTask(null);
          }}
        />
      )}

      {/* FEEDBACK VISUAL REFORÇADO */}
      <SuccessFeedback
        visible={!!successMessage}
        message={successMessage || ''}
        onDismiss={() => setSuccessMessage(null)}
      />

      {/* CONFIRMAÇÃO VISUAL ANTES DE CONCLUIR TAREFA */}
      <ConfirmDialog
        visible={!!taskPendingComplete}
        title="Concluir Atividade?"
        message={`Deseja confirmar a conclusão da atividade "${taskPendingComplete?.title}"?`}
        confirmLabel="Sim, concluir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (taskPendingComplete) performToggle(taskPendingComplete.id, taskPendingComplete.completed);
          setTaskPendingComplete(null);
        }}
        onCancel={() => setTaskPendingComplete(null)}
      />
      <ConfirmDialog
        visible={!!taskPendingUndo}
        title="Desfazer atividade concluída?"
        message='Essa atividade vai voltar para "pendente" e sair do seu Histórico. Deseja continuar?'
        confirmLabel="Sim, desfazer"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          if (taskPendingUndo) performToggle(taskPendingUndo.id, taskPendingUndo.completed);
          setTaskPendingUndo(null);
        }}
        onCancel={() => setTaskPendingUndo(null)}
      />
      <ConfirmDialog
        visible={showLeaveGuide}
        title="Sair da atividade?"
        message="Seu progresso não será salvo. Deseja sair?"
        confirmLabel="Sair"
        cancelLabel="Continuar"

        onConfirm={() => {
          setGuidedTask(null);
          setShowLeaveGuide(false);
        }}

        onCancel={() =>
          setShowLeaveGuide(false)
        }
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