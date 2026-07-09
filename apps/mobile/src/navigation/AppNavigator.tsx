import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {LoginScreen} from '../screens/LoginScreen';
import TasksScreen from '../screens/TasksScreen';
import { AccessibilityProvider } from '../context/AccessibilityContext';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <AccessibilityProvider>
      {user ? <TasksScreen /> : <LoginScreen />}
    </AccessibilityProvider>
  );
}