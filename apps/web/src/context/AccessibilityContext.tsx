'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// 🌟 O IMPORT DO SEU PACOTE ENTRA AQUI:
import { AccessibilityPreferences } from '@seniorease/domain'; 

interface AccessibilityContextType {
  prefs: AccessibilityPreferences;
  userName: string;
  updatePrefs: (newPrefs: AccessibilityPreferences) => Promise<void>;
  loading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false,
    reminderFrequency: 'none',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.displayName || user.email?.split('@')[0] || 'Estudante');
            if (data.preferences) setPrefs(data.preferences);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updatePrefs = async (newPrefs: AccessibilityPreferences) => {
    setPrefs(newPrefs);
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { preferences: newPrefs });
    }
  };

  return (
    <AccessibilityContext.Provider value={{ prefs, userName, updatePrefs, loading }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  return context;
}