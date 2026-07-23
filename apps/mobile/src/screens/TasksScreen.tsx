import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Header } from '../components/Header';
import { GuidedTaskModal } from '../components/GuidedTaskModal';
import { SuccessFeedback } from '../components/SuccessFeedback';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { GetCourseWithTasks, Course, TaskItem } from '@seniorease/domain';

interface TasksScreenProps {
  courseId?: string;
}

export default function TasksScreen({ courseId = 'smartphone-whatsapp' }: TasksScreenProps) {
  const { prefs } = useAccessibility();
  
  // Dados do Curso vindo do Firestore
  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Modais e Feedbacks
  const [guidedTask, setGuidedTask] = useState<TaskItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [taskPendingUndo, setTaskPendingUndo] = useState<TaskItem | null>(null);
  const [taskPendingComplete, setTaskPendingComplete] = useState<TaskItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(!prefs.simplifiedMode);
  const [showLeaveGuide, setShowLeaveGuide] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    setShowCompleted(!prefs.simplifiedMode);
  }, [prefs.simplifiedMode]);

  // Carrega os dados do Curso + Progresso de Conclusão do Usuário
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Busca os dados do curso e tarefas via Core Domain UseCase
        const useCase = new GetCourseWithTasks(db);
        const courseData = await useCase.execute(courseId);
        setCourse(courseData);

        // 2. Busca o progresso de tarefas concluídas pelo usuário
        if (userId && courseData) {
          const progressRef = doc(db, 'users', userId, 'courses_progress', courseId);
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            setUserProgress(progressSnap.data() || {});
          }
        }
      } catch (error) {
        console.error("Erro ao carregar curso e progresso:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId, userId]);

  // Função para alternar o status da tarefa (Marcar/Desfazer)
  const performToggle = async (task: TaskItem) => {
    if (!userId) return;

    const currentStatus = !!userProgress[task.title];
    const newStatus = !currentStatus;

    try {
      const updatedProgress = { ...userProgress, [task.title]: newStatus };
      setUserProgress(updatedProgress);

      // Persiste o progresso do curso para o usuário no Firestore
      const progressRef = doc(db, 'users', userId, 'courses_progress', courseId);
      await setDoc(progressRef, updatedProgress, { merge: true });

      if (newStatus) {
        if (prefs.enhancedFeedback) {
          setSuccessMessage('Muito bem! Atividade concluída!');
        } else {
          Alert.alert("Muito bem! 🎉", "Você concluiu mais uma atividade com sucesso!");
        }
      } else {
        Alert.alert("Atividade retornada para a lista de pendentes.");
      }
    } catch (error) {
      console.error("Erro ao salvar progresso da tarefa:", error);
      Alert.alert("Ops!", "Não foi possível salvar seu progresso. Verifique a conexão.");
    } finally {
      setGuidedTask(null);
    }
  };

  const handleToggleTask = (task: TaskItem) => {
    const isCompleted = !!userProgress[task.title];

    if (prefs.extraConfirmation) {
      if (isCompleted) {
        setTaskPendingUndo(task);
      } else {
        setTaskPendingComplete(task);
      }
      return;
    }

    performToggle(task);
  };

  const getFontSize = (baseSize: number | 'body' | 'button') => {
    const sizeMap: Record<'body' | 'button', number> = { body: 16, button: 15 };
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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={prefs.highContrast ? '#ffff00' : '#2563eb'} />
        <Text style={{ fontSize: getFontSize('body'), marginTop: 10, color: theme.text }}>
          Buscando suas atividades...
        </Text>
      </View>
    );
  }

  const allTasks = course?.tasks || [];
  const pendingTasks = allTasks.filter((t) => !userProgress[t.title]);
  const completedTasks = allTasks.filter((t) => !!userProgress[t.title]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header title={course?.name || "Minhas Atividades 📋"} />

      <View style={{ padding: prefs.spacing === 'wide' ? 24 : 16, flex: 1 }}>
        {allTasks.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: getFontSize('body'), textAlign: 'center', color: theme.text }}>
              Nenhuma tarefa encontrada para este curso.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingTasks}
            keyExtractor={(item) => item.title}
            ItemSeparatorComponent={() => <View style={{ height: prefs.spacing === 'wide' ? 16 : 8 }} />}
            ListEmptyComponent={
              <Text style={{ fontSize: getFontSize('body'), color: theme.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 }}>
                Nenhuma tarefa pendente! Excelente. 🎉
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={prefs.reduceMotion ? 1 : 0.8}
                onPress={() => setGuidedTask(item)}
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
                  onPress={() => handleToggleTask(item)}
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
              completedTasks.length > 0 && !prefs.simplifiedMode ? (
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

                  {showCompleted &&
                    completedTasks.map((item) => (
                      <View
                        key={item.title}
                        style={[
                          styles.taskCard,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            padding: prefs.spacing === 'wide' ? 24 : 20,
                            marginTop: 12,
                            opacity: 0.75,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.taskTitle,
                            { fontSize: getFontSize('body'), color: theme.text, textDecorationLine: 'line-through' },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: theme.btnCompleted }]}
                          onPress={() => handleToggleTask(item)}
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

      {/* FLUXO GUIADO PASSO A PASSO COM DADOS DO FIRESTORE */}
      {guidedTask && (
        <GuidedTaskModal
          task={{
            title: guidedTask.title,
            steps: guidedTask.steps || ['Siga o passo a passo na tela do seu dispositivo.'],
          }}
          onClose={() => {
            if (prefs.extraConfirmation) {
              setShowLeaveGuide(true);
            } else {
              setGuidedTask(null);
            }
          }}
          onComplete={() => {
            handleToggleTask(guidedTask);
          }}
        />
      )}

      {/* FEEDBACK VISUAL REFORÇADO */}
      <SuccessFeedback
        visible={!!successMessage}
        message={successMessage || ''}
        onDismiss={() => setSuccessMessage(null)}
      />

      {/* DIÁLOGOS DE CONFIRMAÇÃO */}
      <ConfirmDialog
        visible={!!taskPendingComplete}
        title="Concluir Atividade?"
        message={`Deseja confirmar a conclusão de "${taskPendingComplete?.title}"?`}
        confirmLabel="Sim, concluir"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (taskPendingComplete) performToggle(taskPendingComplete);
          setTaskPendingComplete(null);
        }}
        onCancel={() => setTaskPendingComplete(null)}
      />

      <ConfirmDialog
        visible={!!taskPendingUndo}
        title="Desfazer atividade concluída?"
        message='Essa atividade vai voltar para "pendente". Deseja continuar?'
        confirmLabel="Sim, desfazer"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          if (taskPendingUndo) performToggle(taskPendingUndo);
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
        onCancel={() => setShowLeaveGuide(false)}
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
    elevation: 2,
  },
  taskTitle: { marginBottom: 8, fontWeight: '500', lineHeight: 28 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnText: { fontWeight: 'bold' },
  toggleCompletedBtn: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
});