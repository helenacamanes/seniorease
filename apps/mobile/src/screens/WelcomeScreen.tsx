import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {AccessibilityPanel, AccessibilityPreferences } from '../components/AccessibilityPanel';

interface WelcomeScreenProps {
  navigation: any; // Ajuste para a tipagem do seu Navigator (Stack ou Router)
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const [showPreferences, setShowPreferences] = useState(false);

  // Estado inicial estruturado idêntico ao da Web
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false,
  });

  // Mapeamento dinâmico de fontes para a estrutura de Boas-Vindas
  const getFontSize = (type: 'title' | 'body') => {
    if (prefs.fontSize === 'extra-large') return type === 'title' ? 36 : 24;
    if (prefs.fontSize === 'large') return type === 'title' ? 30 : 20;
    return type === 'title' ? 24 : 16;
  };

  // Cores dinâmicas baseadas no Alto Contraste
  const theme = {
    bg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    text: prefs.highContrast ? '#ffff00' : '#1e293b',
    border: prefs.highContrast ? '#ffff00' : '#cbd5e1',
    btnPrimary: prefs.highContrast ? '#ffff00' : '#059669',
    btnPrimaryText: prefs.highContrast ? '#000000' : '#ffffff',
    btnSecondary: prefs.highContrast ? '#000000' : '#ffffff',
    btnSecondaryText: prefs.highContrast ? '#ffff00' : '#334155',
  };

  const spacingGap = prefs.spacing === 'wide' ? 24 : 14;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, gap: spacingGap }]}>
        
        <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>
          Olá! Bem-vindo ao SeniorEase 🌟
        </Text>

        {!showPreferences ? (
          <>
            <Text style={[styles.subtitle, { color: theme.text, fontSize: getFontSize('body') }]}>
              Preparamos um espaço simples para você aprender e realizar suas atividades acadêmicas. Como deseja começar?
            </Text>

            <View style={{ gap: spacingGap, marginTop: 10 }}>
              {/* Botão Entrar */}
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: theme.btnPrimary }]}
                onPress={() => navigation.navigate('Auth', { mode: 'login', initialPrefs: prefs })}
              >
                <Text style={[styles.mainButtonText, { color: theme.btnPrimaryText, fontSize: getFontSize('body') + 2 }]}>
                  👋 Já tenho conta (Entrar)
                </Text>
              </TouchableOpacity>

              {/* Botão Cadastrar */}
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: theme.btnSecondary, borderWidth: 2, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Auth', { mode: 'register', initialPrefs: prefs })}
              >
                <Text style={[styles.mainButtonText, { color: theme.btnSecondaryText, fontSize: getFontSize('body') + 2 }]}>
                  📝 Quero me cadastrar
                </Text>
              </TouchableOpacity>

              {/* Gatilho do Painel de Acessibilidade */}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setShowPreferences(true)}
              >
                <Text style={[styles.linkButtonText, { color: prefs.highContrast ? '#ffff00' : '#2563eb', fontSize: getFontSize('body') }]}>
                  ⚙️ Ajustar as Letras, Cores e Espaçamento
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Exibição do Painel de Acessibilidade Completo */
          <View style={{ gap: 20 }}>
            <AccessibilityPanel prefs={prefs} onChange={setPrefs} />

            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: prefs.highContrast ? '#ffffff' : '#1e293b' }]}
              onPress={() => setShowPreferences(false)}
            >
              <Text style={{ color: prefs.highContrast ? '#000000' : '#ffffff', fontWeight: 'bold', textAlign: 'center', fontSize: getFontSize('body') + 2 }}>
                ✔️ Pronto, Salvar e Voltar
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
  card: { padding: 24, borderRadius: 20, borderWidth: 3, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', opacity: 0.9, lineHeight: 28 },
  mainButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  mainButtonText: { fontWeight: 'bold' },
  linkButton: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  linkButtonText: { fontWeight: 'bold', textDecorationLine: 'underline' }
});