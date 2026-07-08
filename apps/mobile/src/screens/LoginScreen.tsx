import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // 🌟 Importando o seletor nativo
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function LoginScreen() {
  // Estados do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userClass, setUserClass] = useState('informatica-basica'); // 🌟 Estado da Turma
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌟 Estados Locais de Acessibilidade (Para espelhar o comportamento da Web antes do registro)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const handleAuth = async () => {
    setErrorMessage('');
    
    if (isRegistering && !name.trim()) {
      setErrorMessage('Por favor, digite o seu nome para continuarmos.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Por favor, preencha os campos abaixo.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // 1. Cria no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Salva no Firestore com Nome, Turma e Preferências Escolhidas
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: name,
          email: user.email,
          class: userClass, // 🌟 Salvando a turma no mobile também
          createdAt: serverTimestamp(),
          preferences: {
            fontSize: fontSize,
            highContrast: highContrast,
            simplifiedMode: false
          }
        });

        Alert.alert('Sucesso 🎉', 'Sua conta foi criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Mapeamento Dinâmico de Tamanho de Fonte (Tokens Mobile)
  const getFontSize = (type: 'label' | 'input' | 'title') => {
    if (fontSize === 'extra-large') {
      if (type === 'title') return 42;
      return 26;
    }
    if (fontSize === 'large') {
      if (type === 'title') return 36;
      return 22;
    }
    // Normal
    if (type === 'title') return 30;
    return 18;
  };

  // 🌟 Temas de Cores Dinâmicos (Alto Contraste)
  const theme = {
    bg: highContrast ? '#000000' : '#f8fafc',
    card: highContrast ? '#121212' : '#ffffff',
    text: highContrast ? '#ffff00' : '#1e293b',
    subtext: highContrast ? '#ffffff' : '#64748b',
    border: highContrast ? '#ffff00' : '#cbd5e1',
    button: highContrast ? '#ffff00' : '#059669',
    buttonText: highContrast ? '#000000' : '#ffffff',
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* ⚙️ PAINEL DE ACESSIBILIDADE ANTES DO REGISTRO (Mobile) */}
      <View style={[styles.accessibilityPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.text, fontSize: getFontSize('label'), fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          ⚙️ Ajuste o Tamanho do Aplicativo:
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.sizeButton} onPress={() => setFontSize('normal')}>
            <Text style={styles.sizeButtonText}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sizeButton} onPress={() => setFontSize('large')}>
            <Text style={[styles.sizeButtonText, { fontSize: 20 }]}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sizeButton} onPress={() => setFontSize('extra-large')}>
            <Text style={[styles.sizeButtonText, { fontSize: 24 }]}>A++</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.contrastButton, { backgroundColor: highContrast ? '#ffffff' : '#1e293b' }]} 
          onPress={() => setHighContrast(!highContrast)}
        >
          <Text style={{ color: highContrast ? '#000000' : '#ffffff', fontWeight: 'bold', fontSize: 16 }}>
            {highContrast ? '⚫ Alto Contraste Ativo' : '⚪ Cores Padrão'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARD PRINCIPAL DE LOGIN / CADASTRO */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text, fontSize: getFontSize('title') }]}>SeniorEase 🌟</Text>
        <Text style={[styles.subtitle, { color: theme.subtext, fontSize: getFontSize('label') }]}>
          {isRegistering ? 'Preencha abaixo para criar seu cadastro rápido.' : 'Entre com seus dados para acessar o painel.'}
        </Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* 🌟 Campo de Nome (Apenas se for Registro) */}
        {isRegistering && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('label') }]}>Seu Nome:</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, fontSize: getFontSize('input') }]}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Como quer ser chamado?"
              placeholderTextColor={highContrast ? '#ffff00' : '#94a3b8'}
            />
          </View>
        )}

        {/* 🌟 Campo de Seleção da Turma (Apenas se for Registro) */}
        {isRegistering && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('label') }]}>Escolha seu Curso:</Text>
            <View style={[styles.pickerContainer, { borderColor: theme.border }]}>
              <Picker
                selectedValue={userClass}
                onValueChange={(itemValue) => setUserClass(itemValue)}
                style={{ color: theme.text, height: 60 }}
                dropdownIconColor={theme.text}
              >
                <Picker.Item label="💻 Introdução à Informática" value="informatica-basica" style={{ fontSize: getFontSize('input') }} />
                <Picker.Item label="🎓 Portal Acadêmico FIAP" value="portal-academico" style={{ fontSize: getFontSize('input') }} />
                <Picker.Item label="📱 Dominando o Celular" value="smartphones" style={{ fontSize: getFontSize('input') }} />
                <Picker.Item label="🔒 Segurança na Internet" value="seguranca-digital" style={{ fontSize: getFontSize('input') }} />
              </Picker>
            </View>
          </View>
        )}

        {/* Campo de E-mail */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('label') }]}>Seu E-mail:</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, fontSize: getFontSize('input') }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="exemplo@email.com"
            placeholderTextColor={highContrast ? '#ffff00' : '#94a3b8'}
          />
        </View>

        {/* Campo de Senha */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text, fontSize: getFontSize('label') }]}>Sua Senha:</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text, fontSize: getFontSize('input') }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Digite aqui..."
            placeholderTextColor={highContrast ? '#ffff00' : '#94a3b8'}
          />
        </View>

        {/* Botão de Ação Principal */}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.buttonText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.buttonText, fontSize: getFontSize('input') + 2 }]}>
              {isRegistering ? 'Concluir Meu Cadastro' : 'Entrar no Sistema'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Alternador de Modo (Login / Registro) */}
        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => {
            setIsRegistering(!isRegistering);
            setErrorMessage('');
            setName('');
          }}
        >
          <Text style={[styles.switchText, { color: highContrast ? '#ffff00' : '#2563eb', fontSize: getFontSize('label') }]}>
            {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  accessibilityPanel: { padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 16, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sizeButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  sizeButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  contrastButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center' },
  card: { padding: 24, borderRadius: 16, borderWidth: 2, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  errorContainer: { backgroundColor: '#fee2e2', borderColor: '#f87171', borderWidth: 2, padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 16, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 2, borderRadius: 8, padding: 12, minHeight: 54 },
  pickerContainer: { borderWidth: 2, borderRadius: 8, overflow: 'hidden', justifyContent: 'center' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { fontWeight: 'bold' },
  switchButton: { marginTop: 24, alignItems: 'center' },
  switchText: { fontWeight: '600', textDecorationLine: 'underline' }
});