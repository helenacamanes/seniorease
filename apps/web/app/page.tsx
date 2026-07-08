'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessibilityPanel, AccessibilityPreferences } from '../src/components/AccessibilityPanel';

export default function WelcomePage() {
  const router = useRouter();
  const [showPreferences, setShowPreferences] = useState(false);

  // Estado único baseado no objeto do painel
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false
  });

  const getFontSizeClass = () => {
    if (prefs.fontSize === 'large') return 'text-2xl';
    if (prefs.fontSize === 'extra-large') return 'text-3xl';
    return 'text-xl';
  };

  const getPageBackground = () => prefs.highContrast ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-800';
  const getCardBackground = () => prefs.highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200';

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${getPageBackground()}`}>
      <div className={`w-full max-w-3xl rounded-2xl shadow-xl p-10 border-2 text-center ${getCardBackground()} ${prefs.spacing === 'wide' ? 'space-y-10' : 'space-y-6'}`}>
        
        <h1 className={`font-bold ${prefs.fontSize === 'normal' ? 'text-4xl' : 'text-5xl'}`}>
          Olá! Bem-vindo ao SeniorEase 🌟
        </h1>
        
        <p className={`${getFontSizeClass()} leading-relaxed opacity-90`}>
          Preparamos um espaço simples para você aprender e realizar suas atividades acadêmicas.
        </p>

        {!showPreferences ? (
          <div className={`flex flex-col ${prefs.spacing === 'wide' ? 'gap-6' : 'gap-4'}`}>
            <button
              onClick={() => router.push(`/auth?mode=login`)}
              className={`w-full py-6 rounded-2xl font-bold shadow-md ${
                prefs.highContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-600 text-white'
              } ${prefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}
            >
              👋 Já tenho conta (Entrar)
            </button>

            <button
              onClick={() => router.push(`/auth?mode=register`)}
              className={`w-full py-6 rounded-2xl font-bold shadow-md border-2 ${
                prefs.highContrast ? 'border-yellow-400 text-yellow-400' : 'bg-white text-slate-800 border-slate-300'
              } ${prefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}
            >
              📝 Quero me cadastrar
            </button>

            <button
              onClick={() => setShowPreferences(true)}
              className={`w-full py-4 text-center underline font-bold ${prefs.highContrast ? 'text-yellow-400' : 'text-blue-600'} ${getFontSizeClass()}`}
            >
              ⚙️ Ajustar as Letras, Cores e Espaçamento
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <AccessibilityPanel prefs={prefs} onChange={setPrefs} />
            <button
              onClick={() => {
                localStorage.setItem('pre_prefs', JSON.stringify(prefs));
                setShowPreferences(false);
              }}
              className={`w-full max-w-2xl py-5 rounded-xl font-bold ${
                prefs.highContrast ? 'bg-white text-black' : 'bg-slate-800 text-white'
              } ${prefs.fontSize === 'normal' ? 'text-xl' : 'text-2xl'}`}
            >
              ✔️ Pronto, Salvar e Voltar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}