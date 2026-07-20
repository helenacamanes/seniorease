'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
  simplifiedMode: boolean;
  extraConfirmation: boolean;
}

interface AccessibilityContextType {
  prefs: AccessibilityPreferences;
  userName: string;
  updatePrefs: (newPrefs: Partial<AccessibilityPreferences>) => Promise<void>;
  loading: boolean;
}

const defaultPrefs: AccessibilityPreferences = {
  fontSize: 'normal',
  highContrast: false,
  spacing: 'normal',
  simplifiedMode: false,
  extraConfirmation: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(defaultPrefs);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Escuta o Firestore em tempo real. Se o idoso mudar a letra no Mobile, muda na Web na hora!
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(data.name || 'Estudante');
            if (data.preferences) {
              setPrefs(data.preferences);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao escutar preferências:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setPrefs(defaultPrefs);
        setUserName('');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updatePrefs = async (newPrefs: Partial<AccessibilityPreferences>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { preferences: updated });
      } catch (error) {
        console.error("Erro ao salvar preferências no Firestore:", error);
      }
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
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
}