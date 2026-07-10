import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../lib/firebase'; // 🌟 Importa o db e auth locais do mobile
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pega o ID do idoso atualmente logado no aplicativo
  const userId = auth.currentUser?.uid;

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ fontSize: 20, marginTop: 10 }}>Buscando suas atividades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Minhas Atividades Acadêmicas</Text>
      
      {tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 18, textAlign: 'center' }}>Nenhuma tarefa encontrada para o seu curso.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
                {item.title}
              </Text>
              
              <TouchableOpacity
                style={[styles.button, item.completed ? styles.btnCompleted : styles.btnPending]}
                onPress={() => handleToggleTask(item.id, item.completed)}
              >
                <Text style={styles.btnText}>
                  {item.completed ? "✓ Concluído" : "Marcar como Pronto"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#1e293b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  taskCard: {
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 2
  },
  taskTitle: { fontSize: 20, marginBottom: 16, color: '#1e293b', fontWeight: '500', lineHeight: 28 },
  completedText: { textDecorationLine: 'line-through', color: '#64748b', opacity: 0.7 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52 
  },
  btnPending: { backgroundColor: '#2563eb' },
  btnCompleted: { backgroundColor: '#16a34a' },
  btnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});