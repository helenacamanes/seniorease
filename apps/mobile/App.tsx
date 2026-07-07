import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { auth, db } from './src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Por favor, preencha os dois campos abaixo.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salva o documento no Firestore pelo celular
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          preferences: {
            fontSize: 'normal',
            highContrast: false,
            simplifiedMode: false
          }
        });

        Alert.alert('Sucesso 🎉', 'Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Sucesso 👋', 'Entrada autorizada!');
      }
    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>

          <Text style={styles.title}>SeniorEase 🌟</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Preencha abaixo para criar seu cadastro rápido.' : 'Entre com seus dados para acessar o app.'}
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Campo do E-mail */}
          <Text style={styles.label}>Seu E-mail:</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Campo da Senha */}
          <Text style={styles.label}>Sua Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite aqui..."
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Botão Principal Ampliado (Mínimo de 60px para toque acessível) */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? 'Concluir Meu Cadastro' : 'Entrar no Sistema'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Alternador de Fluxo Simplificado */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
            }}
          >
            <Text style={styles.switchButtonText}>
              {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#f87171',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 18, // Altura total generosa de toque
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 60, // Touch target ideal para coordenação motora
  },
  buttonDisabled: {
    backgroundColor: '#a7f3d0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});