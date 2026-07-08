import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AccessibilityPanel, AccessibilityPreferences } from '../components/AccessibilityPanel';

interface LoginScreenProps {
  onAuthSuccess?: () => void;
}

// Tipo para controlar qual etapa o idoso está vendo na tela
type ScreenState = 'WELCOME' | 'FORM' | 'PREFERENCES';

export function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  // 1. Estado de preferências (idêntico ao Web)
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false,
  });

  // 2. Estados de fluxo de tela
  const [screenState, setScreenState] = useState<ScreenState>('WELCOME');
  const [isRegistering, setIsRegistering] = useState(false);

  // 3. Estados dos campos do formulário
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Auxiliares de estilização dinâmica baseada nas preferências
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

  // Ações de clique
  const handleAuthAction = () => {
    if (prefs.extraConfirmation) {
      Alert.alert(
        "Confirmar", 
        isRegistering ? "Deseja criar sua conta com esses dados?" : "Deseja entrar no sistema?",
        [
          { text: "Voltar", style: "cancel" },
          { text: "Sim, Avançar", onPress: () => { if (onAuthSuccess) onAuthSuccess(); } }
        ]
      );
    } else {
      if (onAuthSuccess) onAuthSuccess();
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, spacingStyle]}>
        
        {/* ================= ESTADO 1: ESCOLHA INICIAL (IGUAL A WEB) ================= */}
        {screenState === 'WELCOME' && (
          <>
            <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>
              Olá! Bem-vindo ao SeniorEase 🌟
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.text, fontSize: getFontSize('body') }]}>
              Preparamos um espaço simples para você aprender. Como deseja começar hoje?
            </Text>

            <View style={[styles.buttonGroup, { gap: prefs.spacing === 'wide' ? 20 : 12 }]}>
              {/* Opção 1: Login */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.btnPrimary }]}
                onPress={() => {
                  setIsRegistering(false);
                  setScreenState('FORM');
                }}
              >
                <Text style={[styles.btnText, { color: theme.btnPrimaryText, fontSize: getFontSize('button') }]}>
                  👋 Já tenho conta (Entrar)
                </Text>
              </TouchableOpacity>

              {/* Opção 2: Registro */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.btnSecondary, borderWidth: 2, borderColor: theme.border }]}
                onPress={() => {
                  setIsRegistering(true);
                  setScreenState('FORM');
                }}
              >
                <Text style={[styles.btnText, { color: theme.btnSecondaryText, fontSize: getFontSize('button') }]}>
                  📝 Quero me cadastrar
                </Text>
              </TouchableOpacity>

              {/* Opção 3: Preferências de Acessibilidade */}
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => setScreenState('PREFERENCES')}
              >
                <Text style={[styles.linkBtnText, { color: prefs.highContrast ? '#ffff00' : '#2563eb', fontSize: getFontSize('body') }]}>
                  ⚙️ Ajustar as Letras, Cores e Espaçamento
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ================= ESTADO 2: FORMULÁRIO ADAPTADO ================= */}
        {screenState === 'FORM' && (
          <>
            <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>
              {isRegistering ? 'Criar Nova Conta' : 'Entrar no Sistema'}
            </Text>

            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Seu Nome Completo:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, fontSize: getFontSize('body') }]}
                  placeholder="Digite seu nome aqui"
                  placeholderTextColor={prefs.highContrast ? '#777' : '#94a3b8'}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('body') }]}>Seu E-mail:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, fontSize: getFontSize('body') }]}
                placeholder="exemplo@email.com"
                placeholderTextColor={prefs.highContrast ? '#777' : '#94a3b8'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={[styles.buttonGroup, { marginTop: 10, gap: prefs.spacing === 'wide' ? 16 : 10 }]}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.btnPrimary }]} onPress={handleAuthAction}>
                <Text style={[styles.btnText, { color: theme.btnPrimaryText, fontSize: getFontSize('button') }]}>
                  {isRegistering ? 'Confirmar Cadastro ➔' : 'Entrar Agora ➔'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: 'transparent' }]} 
                onPress={() => setScreenState('WELCOME')}
              >
                <Text style={[styles.linkBtnText, { color: theme.text, fontSize: getFontSize('body'), textDecorationLine: 'none' }]}>
                  ⬅️ Voltar para o início
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ================= ESTADO 3: PAINEL DE ACESSIBILIDADE ================= */}
        {screenState === 'PREFERENCES' && (
          <View style={{ gap: 20 }}>
            <AccessibilityPanel prefs={prefs} onChange={setPrefs} />

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: prefs.highContrast ? '#ffff00' : '#1e293b' }]}
              onPress={() => setScreenState('WELCOME')}
            >
              <Text style={{ color: prefs.highContrast ? '#000000' : '#ffffff', fontWeight: 'bold', fontSize: getFontSize('button') }}>
                ✔️ Pronto, Voltar para o Início
              </Text>
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
});