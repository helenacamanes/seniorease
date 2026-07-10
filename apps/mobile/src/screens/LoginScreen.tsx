import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AccessibilityPanel, AccessibilityPreferences } from '../components/AccessibilityPanel';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// 🌟 IMPORTANTE: Puxamos o auth e o db locais do mobile
import { auth, db } from '../lib/firebase'; 
import { inicializarPerfilE_Tarefas } from '@seniorease/domain';

interface LoginScreenProps {
  onAuthSuccess?: () => void;
}

type ScreenState = 'WELCOME' | 'FORM' | 'PREFERENCES';

export function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false,
  });

  const [screenState, setScreenState] = useState<ScreenState>('WELCOME');
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);

  const getFontSize = (type: 'title' | 'body' | 'button') => {
    const modifier = prefs.fontSize === 'extra-large' ? 6 : prefs.fontSize === 'large' ? 3 : 0;
    if (type === 'title') return 24 + modifier;
    if (type === 'button') return 18 + modifier;
    return 16 + modifier;
  };

  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    border: prefs.highContrast ? '#ffff00' : '#cbd5e1',
    btnPrimary: prefs.highContrast ? '#ffff00' : '#2563eb',
    btnPrimaryText: prefs.highContrast ? '#000000' : '#ffffff',
    btnSecondary: prefs.highContrast ? '#000000' : '#f1f5f9',
    btnSecondaryText: prefs.highContrast ? '#ffff00' : '#334155',
    inputBg: prefs.highContrast ? '#1c1c1c' : '#ffffff',
  };

  const spacingStyle = {
    gap: prefs.spacing === 'wide' ? 24 : 14,
    padding: prefs.spacing === 'wide' ? 24 : 16,
  };

  const executeAuth = async () => {
    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 🌟 INVERSÃO DE DEPENDÊNCIA APLICADA NO MOBILE: Injeta o 'db' do Mobile
        await inicializarPerfilE_Tarefas(db, userCredential.user.uid, name, email, selectedCourse);
        
        Alert.alert("Sucesso!", "Sua conta foi criada e suas atividades foram configuradas com sucesso.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", "Falha na autenticação. Verifique os dados digitados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, spacingStyle]}>

        {screenState === 'WELCOME' && (
          <>
            <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>Olá! Bem-vindo ao SeniorEase 🌟</Text>
            <Text style={[styles.subtitle, { color: theme.text, fontSize: getFontSize('body') }]}>Preparamos um espaço simples para você aprender. Como deseja começar hoje?</Text>
            <View style={[styles.buttonGroup, { gap: prefs.spacing === 'wide' ? 20 : 12 }]}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.btnPrimary }]} onPress={() => { setIsRegistering(false); setScreenState('FORM'); }}>
                <Text style={[styles.btnText, { color: theme.btnPrimaryText, fontSize: getFontSize('button') }]}>👋 Já tenho conta (Entrar)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.btnSecondary, borderWidth: 2, borderColor: theme.border }]} onPress={() => { setIsRegistering(true); setScreenState('FORM'); }}>
                <Text style={[styles.btnText, { color: theme.btnSecondaryText, fontSize: getFontSize('button') }]}>📝 Quero me cadastrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkBtn} onPress={() => setScreenState('PREFERENCES')}>
                <Text style={[styles.linkBtnText, { color: prefs.highContrast ? '#ffff00' : '#2563eb', fontSize: getFontSize('body') }]}>⚙️ Ajustar Letras e Cores</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {screenState === 'FORM' && (
          <>
            <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>{isRegistering ? 'Criar Nova Conta' : 'Entrar no Sistema'}</Text>
            
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Seu Nome Completo:</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, fontSize: getFontSize('body') }]} placeholder="Digite seu nome" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
              </View>
            )}

            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Escolha sua Turma: <Text style={{ color: '#ef4444' }}>*</Text></Text>
                <View style={{ gap: 10, marginTop: 4 }}>
                  <TouchableOpacity style={[styles.courseOption, { borderColor: selectedCourse === 'tecnologia-iniciantes' ? theme.btnPrimary : theme.border }, selectedCourse === 'tecnologia-iniciantes' && { backgroundColor: '#e0f2fe' }]} onPress={() => setSelectedCourse('tecnologia-iniciantes')}>
                    <Text style={{ fontSize: getFontSize('body'), color: theme.text, fontWeight: 'bold' }}>{selectedCourse === 'tecnologia-iniciantes' ? '🟢 ' : '⚪ '} Tecnologia para Iniciantes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.courseOption, { borderColor: selectedCourse === 'smartphone-whatsapp' ? theme.btnPrimary : theme.border }, selectedCourse === 'smartphone-whatsapp' && { backgroundColor: '#e0f2fe' }]} onPress={() => setSelectedCourse('smartphone-whatsapp')}>
                    <Text style={{ fontSize: getFontSize('body'), color: theme.text, fontWeight: 'bold' }}>{selectedCourse === 'smartphone-whatsapp' ? '🟢 ' : '⚪ '} Uso do Smartphone e Whatsapp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Seu E-mail:</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, fontSize: getFontSize('body') }]} placeholder="exemplo@email.com" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Sua Senha:</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, fontSize: getFontSize('body') }]} placeholder="Digite sua senha" placeholderTextColor="#94a3b8" secureTextEntry={true} autoCapitalize="none" value={password} onChangeText={setPassword} />
            </View>

            <View style={[styles.buttonGroup, { marginTop: 10, gap: 12 }]}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.btnPrimary }]} onPress={() => {
                if (!email || !password || (isRegistering && (!name || !selectedCourse))) {
                  Alert.alert("Aviso", "Preencha todos os campos e selecione a sua turma.");
                  return;
                }
                executeAuth();
              }}>
                <Text style={[styles.btnText, { color: theme.btnPrimaryText, fontSize: getFontSize('button') }]}>{loading ? 'Carregando...' : isRegistering ? 'Confirmar Cadastro ➔' : 'Entrar Agora ➔'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent' }]} onPress={() => setScreenState('WELCOME')}>
                <Text style={[styles.linkBtnText, { color: theme.text, fontSize: getFontSize('body'), textDecorationLine: 'none' }]}>⬅️ Voltar para o início</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {screenState === 'PREFERENCES' && (
          <View style={{ gap: 20 }}>
            <AccessibilityPanel prefs={prefs} onChange={setPrefs} />
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#1e293b' }]} onPress={() => setScreenState('WELCOME')}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: getFontSize('button') }}>✔️ Pronto, Voltar</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: { borderRadius: 24, borderWidth: 3, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', opacity: 0.8, lineHeight: 26, marginBottom: 10 },
  buttonGroup: { flexDirection: 'column', width: '100%' },
  btn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minHeight: 62 },
  btnText: { fontWeight: 'bold' },
  linkBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 12 },
  linkBtnText: { fontWeight: 'bold', textDecorationLine: 'underline', textAlign: 'center' },
  inputGroup: { flexDirection: 'column', gap: 6, width: '100%' },
  label: { fontWeight: '600' },
  input: { borderWidth: 2, padding: 14, borderRadius: 12, minHeight: 56 },
  courseOption: { borderWidth: 2, padding: 16, borderRadius: 12, backgroundColor: '#ffffff', minHeight: 56, justifyContent: 'center' },
});