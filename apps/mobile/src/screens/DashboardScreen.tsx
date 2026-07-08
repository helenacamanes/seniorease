import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AccessibilityPanel, AccessibilityPreferences } from '../components/AccessibilityPanel';

interface DashboardScreenProps {
  userName?: string;
  initialPrefs?: AccessibilityPreferences;
  onLogout?: () => void;
}

const COURSES_DATA = [
  {
    id: 'informatica-basica',
    title: '💻 Introdução à Informática',
    description: 'Aprenda a mexer no celular, organizar contatos, usar aplicativos e navegar na internet de forma segura.',
    lessonsCount: 8,
    progress: 40,
  },
  {
    id: 'portal-academico',
    title: '🎓 Portal Acadêmico FIAP',
    description: 'Guia prático para você assistir suas aulas, ver suas notas e conversar com os professores.',
    lessonsCount: 5,
    progress: 0,
  },
  {
    id: 'seguranca-digital',
    title: '🔒 Segurança na Internet',
    description: 'Evite golpes, aprenda a identificar mensagens falsas e proteja suas senhas.',
    lessonsCount: 6,
    progress: 85,
  }
];

export function DashboardScreen({ userName = 'Estudante', initialPrefs, onLogout }: DashboardScreenProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(initialPrefs || {
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false,
  });

  // Auxiliares de Fonte
  const getFontSize = (type: 'title' | 'sub' | 'body') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    if (type === 'title') return 26 + modifier;
    if (type === 'sub') return 20 + modifier;
    return 16 + modifier;
  };

  // Cores Temáticas
  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    border: prefs.highContrast ? '#ffff00' : '#e2e8f0',
    barBg: prefs.highContrast ? '#333' : '#e2e8f0',
    barFill: prefs.highContrast ? '#ffff00' : '#2563eb',
    btnTop: prefs.highContrast ? '#ffff00' : '#eff6ff',
    btnTopText: prefs.highContrast ? '#000000' : '#1d4ed8',
  };

  const spacingStyle = {
    gap: prefs.spacing === 'wide' ? 24 : 14,
    padding: prefs.spacing === 'wide' ? 20 : 14,
  };

  const handleCoursePress = (courseTitle: string) => {
    if (prefs.extraConfirmation) {
      Alert.alert(
        "Abrir Curso",
        `Deseja entrar nas aulas de:\n${courseTitle}?`,
        [
          { text: "Não, Voltar", style: "cancel" },
          { text: "Sim, Entrar", onPress: () => {} }
        ]
      );
    }
  };

  const handleSignOut = () => {
    if (prefs.extraConfirmation) {
      Alert.alert("Sair", "Você quer mesmo sair do aplicativo agora?", [
        { text: "Ficar", style: "cancel" },
        { text: "Sair", onPress: () => { if (onLogout) onLogout(); } }
      ]);
    } else {
      if (onLogout) onLogout();
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.bg }]}>
      
      {/* 🔝 CABEÇALHO REATIVO E ACESSÍVEL */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <Text style={[styles.welcomeText, { color: theme.text, fontSize: getFontSize('title') }]}>
          Olá, {userName}! 👋
        </Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.settingsToggle, { backgroundColor: theme.btnTop, borderColor: theme.border }]} 
            onPress={() => setShowSettings(!showSettings)}
          >
            <Text style={[styles.settingsToggleText, { color: theme.btnTopText, fontSize: getFontSize('body') }]}>
              {showSettings ? '❌ Fechar' : '⚙️ Ajustar Tela'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, { color: prefs.highContrast ? '#ffff00' : '#64748b', fontSize: getFontSize('body'), textDecorationLine: 'underline' }]}>
              Sair
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: prefs.spacing === 'wide' ? 24 : 16 }}>
        
        {/* 🎛️ MENU FLUTUANTE DE AJUSTES DENTRO DA ÁREA LOGADA */}
        {showSettings && (
          <View style={[styles.settingsContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <AccessibilityPanel prefs={prefs} onChange={setPrefs} />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: getFontSize('sub') }]}>
          Seus Cursos Disponíveis:
        </Text>

        {/* 📚 RENDERIZAÇÃO DA LISTA DE CARDS */}
        {COURSES_DATA.map((course) => (
          <View key={course.id} style={[styles.courseCard, { backgroundColor: theme.card, borderColor: theme.border }, spacingStyle]}>
            <View>
              <Text style={[styles.courseTitle, { color: theme.text, fontSize: getFontSize('sub') }]}>
                {course.title}
              </Text>
              
              {/* Oculta textos longos caso o Modo Simplificado esteja ativo */}
              {!prefs.simplifiedMode && (
                <Text style={[styles.courseDesc, { color: theme.text, fontSize: getFontSize('body') }]}>
                  {course.description}
                </Text>
              )}
            </View>

            {/* PROGRESSO */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressStatus, { color: theme.text, fontSize: getFontSize('body') - 2 }]}>
                  {course.progress === 0 ? '🚫 Não iniciado' : course.progress === 100 ? '✅ Concluído' : '⏳ No meio'}
                </Text>
                <Text style={[styles.progressPct, { color: theme.text, fontSize: getFontSize('body'), fontWeight: 'bold' }]}>
                  {course.progress}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.barBg }]}>
                <View style={[styles.progressFill, { width: `${course.progress}%`, backgroundColor: theme.barFill }]} />
              </View>
            </View>

            {/* BOTÃO DE ENTRAR MASSIVO (FÁCIL CLIQUE) */}
            <TouchableOpacity 
              style={[styles.enterBtn, { backgroundColor: prefs.highContrast ? '#ffff00' : '#1e293b' }]}
              onPress={() => handleCoursePress(course.title)}
            >
              <Text style={[styles.enterBtnText, { color: prefs.highContrast ? '#000000' : '#ffffff', fontSize: getFontSize('body') + 2 }]}>
                Entrar no Curso ➔
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  welcomeText: { fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingsToggle: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  settingsToggleText: { fontWeight: 'bold' },
  logoutBtn: { padding: 6 },
  logoutText: { fontWeight: '600' },
  settingsContainer: { padding: 12, borderRadius: 16, borderWidth: 2, marginBottom: 10 },
  sectionTitle: { fontWeight: 'bold', marginTop: 4 },
  courseCard: { borderRadius: 20, borderWidth: 3, elevation: 2 },
  courseTitle: { fontWeight: 'bold', marginBottom: 6 },
  courseDesc: { opacity: 0.8, lineHeight: 24, marginBottom: 10 },
  progressContainer: { marginTop: 4, marginBottom: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressStatus: { fontWeight: '600' },
  progressPct: {},
  progressBar: { height: 16, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  enterBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 6, minHeight: 56 },
  enterBtnText: { fontWeight: 'bold' }
});