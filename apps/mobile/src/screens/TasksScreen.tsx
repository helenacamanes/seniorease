import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../lib/firebase'; // 🌟 Importa o db e auth locais do mobile
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Header } from '../components/Header';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

export default function TasksScreen() {
  const { prefs } = useAccessibility();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Pega o ID do idoso atualmente logado no aplicativo
  const userId = auth.currentUser?.uid;

  // 🌟 Preferências de acessibilidade aplicadas aqui também, do mesmo jeito
  // que já era feito no DashboardScreen (fonte, contraste e espaçamento).
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
      snapshot.forEach((doc) => {
        tasksList.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar tarefas no mobile:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!userId) return;

    try {
      const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        completed: !currentStatus
      });
      
      if (!currentStatus) {
        Alert.alert("Muito bem! 🎉", "Você concluiu mais uma atividade com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao alterar status da tarefa:", error);
      Alert.alert("Ops!", "Não foi possível salvar o seu progresso. Verifique sua internet.");
    }
  };

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
            data={tasks}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: prefs.spacing === 'wide' ? 16 : 8 }} />}
            renderItem={({ item }) => (
              <View style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border, padding: prefs.spacing === 'wide' ? 24 : 20 }]}>
                <Text style={[
                  styles.taskTitle,
                  { fontSize: getFontSize('body'), color: theme.text },
                  item.completed && styles.completedText
                ]}>
                  {item.title}
                </Text>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: item.completed ? theme.btnCompleted : theme.btnPending }]}
                  onPress={() => handleToggleTask(item.id, item.completed)}
                  accessibilityRole="button"
                  accessibilityLabel={item.completed ? `Marcar ${item.title} como não concluída` : `Marcar ${item.title} como concluída`}
                >
                  <Text style={[styles.btnText, { fontSize: getFontSize('button'), color: theme.btnText }]}>
                    {item.completed ? "✓ Concluído" : "Marcar como Pronto"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
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
  taskTitle: { marginBottom: 16, fontWeight: '500', lineHeight: 28 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.7 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52
  },
  btnText: { fontWeight: 'bold' }
});
