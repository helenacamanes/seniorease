'use client';

import React from 'react';

// Interface com todas as preferências exigidas pelo Hackathon
export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
  simplifiedMode: boolean;
  extraConfirmation: boolean;
}

interface AccessibilityPanelProps {
  prefs: AccessibilityPreferences;
  onChange: (updatedPrefs: AccessibilityPreferences) => void;
}

export function AccessibilityPanel({ prefs, onChange }: AccessibilityPanelProps) {
  
  const updatePref = (key: keyof AccessibilityPreferences, value: any) => {
    onChange({ ...prefs, [key]: value });
  };

  // Cores dinâmicas para Alto Contraste
  const panelBg = prefs.highContrast ? 'bg-zinc-950 border-yellow-400 text-yellow-400' : 'bg-white border-slate-200 text-slate-800';
  const btnActive = prefs.highContrast ? 'bg-yellow-400 text-black font-bold border-yellow-400' : 'bg-blue-600 text-white font-semibold border-blue-600';
  const btnInactive = prefs.highContrast ? 'border-2 border-yellow-400 text-yellow-400 hover:bg-zinc-900' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
  const labelSize = prefs.fontSize === 'normal' ? 'text-lg' : 'text-xl font-bold';

  return (
    <div className={`w-full max-w-2xl p-8 rounded-2xl border-4 shadow-xl transition-all duration-200 ${panelBg} ${prefs.spacing === 'wide' ? 'space-y-8' : 'space-y-5'}`}>
      
      <h2 className={`font-bold text-center border-b-2 pb-3 ${prefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'} ${prefs.highContrast ? 'border-yellow-400' : 'border-slate-200'}`}>
        ⚙️ Configurar Opções de Acessibilidade
      </h2>

      {/* 1. TAMANHO DA FONTE */}
      <div className="flex flex-col gap-2">
        <span className={labelSize}>1. Tamanho das Letras:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['normal', 'large', 'extra-large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updatePref('fontSize', size)}
              className={`p-4 rounded-xl border-2 transition-all text-center font-bold min-h-[60px] ${prefs.fontSize === size ? btnActive : btnInactive}`}
            >
              {size === 'normal' && 'A (Normal)'}
              {size === 'large' && 'A+ (Grande)'}
              {size === 'extra-large' && 'A++ (Muito Grande)'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ESPAÇAMENTO */}
      <div className="flex flex-col gap-2">
        <span className={labelSize}>2. Espaço entre os Botões e Textos:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updatePref('spacing', 'normal')}
            className={`p-4 rounded-xl border-2 font-bold min-h-[60px] ${prefs.spacing === 'normal' ? btnActive : btnInactive}`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => updatePref('spacing', 'wide')}
            className={`p-4 rounded-xl border-2 font-bold min-h-[60px] ${prefs.spacing === 'wide' ? btnActive : btnInactive}`}
          >
            ↔️ Mais Espaçado (Fácil de Tocar)
          </button>
        </div>
      </div>

      {/* 3. ALTO CONTRASTE */}
      <div className="flex flex-col gap-2">
        <span className={labelSize}>3. Cores da Tela:</span>
        <button
          type="button"
          onClick={() => updatePref('highContrast', !prefs.highContrast)}
          className={`w-full p-4 rounded-xl font-bold border-2 text-xl min-h-[60px] transition-all ${
            prefs.highContrast 
              ? 'bg-yellow-400 text-black border-yellow-400' 
              : 'bg-zinc-800 text-white border-zinc-800'
          }`}
        >
          {prefs.highContrast ? '⚫ Alto Contraste Ativo' : '⚪ Modo de Cores Padrão'}
        </button>
      </div>

      {/* 4. MODALIDADE DE INTERFACE SIMPLIFICADA */}
      <div className="flex flex-col gap-2">
        <span className={labelSize}>4. Estilo do Menu:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updatePref('simplifiedMode', false)}
            className={`p-4 rounded-xl border-2 font-bold min-h-[60px] ${!prefs.simplifiedMode ? btnActive : btnInactive}`}
          >
            Modo Completo
          </button>
          <button
            type="button"
            onClick={() => updatePref('simplifiedMode', true)}
            className={`p-4 rounded-xl border-2 font-bold min-h-[60px] ${prefs.simplifiedMode ? btnActive : btnInactive}`}
          >
            ⭐ Modo Simplificado (Apenas o Básico)
          </button>
        </div>
      </div>

      {/* 5. CONFIRMAÇÃO EXTRA */}
      <div className="flex flex-col gap-2">
        <span className={labelSize}>5. Proteção contra Cliques Errados:</span>
        <button
          type="button"
          onClick={() => updatePref('extraConfirmation', !prefs.extraConfirmation)}
          className={`w-full p-4 rounded-xl font-bold border-2 text-lg min-h-[60px] transition-all ${
            prefs.extraConfirmation ? btnActive : btnInactive
          }`}
        >
          {prefs.extraConfirmation ? '🔒 Ativado: Perguntar antes de sair ou avançar' : '🔓 Desativado: Avançar direto'}
        </button>
      </div>

    </div>
  );
}