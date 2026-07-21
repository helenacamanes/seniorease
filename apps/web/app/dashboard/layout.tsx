'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../src/lib/firebase';
import { signOut } from 'firebase/auth';
import { AccessibilityProvider, useAccessibility } from '../../src/context/AccessibilityContext';
import ConfirmDialog from '../../src/components/ConfirmDialog';

// Removido o AccessibilityPanel que não será mais usado aqui

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { prefs, loading } = useAccessibility(); // Removido o updatePrefs daqui, já que os ajustes saíram do header
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (prefs.extraConfirmation) {
      setShowLogoutConfirm(true);
      return;
    }
    performLogout();
  };

  const performLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-3xl font-bold text-slate-700 animate-pulse">Carregando seu painel...</h2>
      </div>
    );
  }

  const getFontSizeClass = () => {
    if (prefs.fontSize === 'large') return 'text-xl';
    if (prefs.fontSize === 'extra-large') return 'text-2xl';
    return 'text-base';
  };

  const theme = {
    bg: prefs.highContrast ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-800',
    headerBg: prefs.highContrast ? 'bg-zinc-950 border-b-4 border-yellow-400' : 'bg-white border-b-2 border-slate-200 shadow-sm',
    logoutText: prefs.highContrast ? 'text-yellow-400 underline' : 'text-slate-500 hover:text-red-600 font-semibold'
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme.bg}`}>
      {/* 🧭 HEADER DA ÁREA LOGADA SIMPLIFICADO */}
      <nav className={`p-5 sticky top-0 z-50 transition-colors duration-200 ${theme.headerBg}`}>
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
          <span className={`font-black tracking-tight ${prefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}>
            SeniorEase 🌟
          </span>
          <div className="flex items-center gap-6">
            {/* O BOTÃO "AJUSTAR TELA" FOI REMOVIDO DAQUI */}
            <button 
              onClick={handleLogout} 
              className={`transition-all bg-transparent border-0 cursor-pointer ${theme.logoutText} ${getFontSizeClass()}`}
            >
              Sair
            </button>
          </div>
        </div>
      </nav>


      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Aviso importante 🤔"
        message="Você quer mesmo sair do aplicativo agora?"
        confirmLabel="Sim, quero sair"
        cancelLabel="Não, quero continuar"
        destructive
        onConfirm={() => {
          setShowLogoutConfirm(false);
          performLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AccessibilityProvider>
  );
}