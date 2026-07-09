import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/lib/firebase';

// 🌟 SUBSTITUÍMOS O IMPORT DO REACT-NATIVE POR ESTES DO SAFE-AREA-CONTEXT:
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AccessibilityProvider } from './src/context/AccessibilityContext';
import {LoginScreen} from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator'; 

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    // 🌟 EMBRULHAMOS COM O PROVIDER DA NOVA BIBLIOTECA:
    <SafeAreaProvider>
      <AccessibilityProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          
          {user ? <MainTabNavigator /> : <LoginScreen />}

        </SafeAreaView>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});