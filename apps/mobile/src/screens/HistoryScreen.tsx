import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Header } from '../components/Header';
import { TaskHistory, Task } from '@seniorease/domain';

// 🌟 "Histórico simples de atividades realizadas" pedido no briefing:
// mostra só o que já foi concluído, da mais recente para a mais antiga.
export default function HistoryScreen() {
  const { prefs } = useAccessibility();
  const [history, setHistory] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    textMuted: prefs.highContrast ? '#ffffff' : '#64748b',
    border: prefs.highContrast ? '#ffff00' : '#cbd5e1',
  };

  const getFontSize = (type: 'title' | 'body') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    return type === 'title' ? 24 + modifier : 18 + modifier;
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
      setHistory(TaskHistory.getCompletedSortedByDate(tasksList));
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar histórico:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title="Histórico de Atividades 🗂️" />

      <View style={{ padding: prefs.spacing === 'wide' ? 24 : 16, flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={prefs.highContrast ? '#ffff00' : '#2563eb'} />
        ) : history.length === 0 ? (
          <Text style={{ fontSize: getFontSize('body'), color: theme.textMuted, textAlign: 'center', marginTop: 40 }}>
            Você ainda não concluiu nenhuma atividade. Quando concluir, ela aparece aqui! 🌟
          </Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, padding: prefs.spacing === 'wide' ? 20 : 16 }]}>
                <Text style={{ fontSize: getFontSize('body'), color: theme.text, fontWeight: '600' }}>
                  ✅ {item.title}
                </Text>
                {item.completedAt && (
                  <Text style={{ fontSize: getFontSize('body') - 4, color: theme.textMuted, marginTop: 4 }}>
                    Concluída em {formatDate(item.completedAt)}
                  </Text>
                )}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: 16 },
});
