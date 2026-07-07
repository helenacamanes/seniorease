import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function LoginScreen() {
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
      }
    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <h1 style={styles.title}>SeniorEase 🌟</h1>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Preencha abaixo para criar seu cadastro rápido.' : 'Entre com seus dados para acessar o painel.'}
        </Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Seu E-mail:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="exemplo@email.com"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sua Senha:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Digite aqui..."
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Concluir Meu Cadastro' : 'Entrar no Sistema'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => {
            setIsRegistering(!isRegistering);
            setErrorMessage('');
          }}
        >
          <Text style={styles.switchText}>
            {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderFocus: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  errorContainer: { backgroundColor: '#fee2e2', borderColor: '#f87171', borderWidth: 2, padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 16, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 18, fontWeight: '500', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 18, color: '#1e293b' },
  button: { backgroundColor: '#059669', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  switchButton: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#2563eb', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' }
});