'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AccessibilityPanel, AccessibilityPreferences } from '../../src/components/AccessibilityPanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.displayName || user.email?.split('@')[0] || 'Estudante');
          if (data.preferences) {
            setPrefs(data.preferences);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePrefsChange = async (updatedPrefs: AccessibilityPreferences) => {
    setPrefs(updatedPrefs);
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: updatedPrefs
      });
    }
  };

  const handleLogout = async () => {
    if (prefs.extraConfirmation) {
      const confirmar = window.confirm("Você quer mesmo sair do aplicativo agora?");
      if (!confirmar) return;
    }
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-3xl font-bold text-slate-700 animate-pulse">Carregando seu painel de estudos...</h2>
      </div>
    );
  }

  const getFontSizeClass = () => {
    if (prefs.fontSize === 'large') return 'text-xl';
    if (prefs.fontSize === 'extra-large') return 'text-2xl';
    return 'text-base';
  };

  // 🎨 Definição temática espelhada do Mobile
  const theme = {
    bg: prefs.highContrast ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-800',
    headerBg: prefs.highContrast ? 'bg-zinc-950 border-b-4 border-yellow-400' : 'bg-white border-b-2 border-slate-200 shadow-sm',
    btnTop: prefs.highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    logoutText: prefs.highContrast ? 'text-yellow-400 underline' : 'text-slate-500 hover:text-red-600 font-semibold'
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme.bg}`}>
      
      {/* 🔝 HEADER ESPELHADO DO MOBILE (MANTENDO RESPONSIVIDADE WEB) */}
      <nav className={`p-5 sticky top-0 z-50 transition-colors duration-200 ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
          
          {/* Logo / Título do App */}
          <span className={`font-black tracking-tight ${prefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}>
            SeniorEase 🌟
          </span>

          {/* Grupo de botões à direita, igual à disposição estrutural móvel */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-5 py-2.5 rounded-xl font-bold border-2 transition-all active:scale-95 ${theme.btnTop} ${getFontSizeClass()}`}
            >
              {showSettings ? '❌ Fechar' : '⚙️ Ajustar Tela'}
            </button>

            <button
              onClick={handleLogout}
              className={`transition-all bg-transparent border-0 cursor-pointer ${theme.logoutText} ${getFontSizeClass()}`}
            >
              Sair
            </button>
          </div>

        </div>
      </nav>

      {/* 🎛️ PAINEL FLUTUANTE DE AJUSTES (Abaixo do Header se ativo) */}
      {showSettings && (
        <div className={`w-full p-6 border-b-4 flex justify-center transition-all ${
          prefs.highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-slate-100 border-slate-300'
        }`}>
          <AccessibilityPanel prefs={prefs} onChange={handlePrefsChange} />
        </div>
      )}

      {/* CONTEÚDO DA PÁGINA (Injeta as propriedades reativas para a page.tsx) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { prefs, userName } as any);
          }
          return child;
        })}
      </main>

    </div>
  );
}