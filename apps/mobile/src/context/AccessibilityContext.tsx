import React, { createContext, useContext, useState, useEffect } from 'react';

// Interface de preferências de acessibilidade (sem síntese de voz)
export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  spacing: 'normal' | 'wide';
  highContrast: boolean;
  extraConfirmation?: boolean;
  simplifiedMode?: boolean;
  reminderFrequency?: 'none' | 'daily' | 'weekly';
  enhancedFeedback?: boolean;
  reduceMotion?: boolean;
}

interface AccessibilityContextData {
  prefs: AccessibilityPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<AccessibilityPreferences>>;
  updatePrefs: (newPrefs: Partial<AccessibilityPreferences>) => void;
}

const defaultPreferences: AccessibilityPreferences = {
  fontSize: 'normal',
  spacing: 'normal',
  highContrast: false,
  extraConfirmation: false,
  simplifiedMode: false,
  reminderFrequency: 'none',
  enhancedFeedback: false,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextData>({
  prefs: defaultPreferences,
  setPrefs: () => {},
  updatePrefs: () => {},
});

const STORAGE_KEY = '@seniorease/accessibility_prefs';

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(defaultPreferences);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setPrefs((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Erro ao carregar preferências de acessibilidade:', e);
      }
    }
  }, []);

  const updatePrefs = (newPrefs: Partial<AccessibilityPreferences>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...newPrefs };
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Erro ao salvar preferências de acessibilidade:', e);
        }
      }
      return updated;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ prefs, setPrefs, updatePrefs }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
};