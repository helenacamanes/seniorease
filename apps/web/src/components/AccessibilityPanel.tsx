'use client';

export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
  simplifiedMode: boolean;
  extraConfirmation: boolean;
  reminderFrequency: 'none' | 'daily' | 'weekly';
}

interface AccessibilityPanelProps {
  prefs: AccessibilityPreferences;
  onChange: (updatedPrefs: AccessibilityPreferences) => void;
}

export function AccessibilityPanel({ prefs, onChange }: AccessibilityPanelProps) {
  const getFontSizeClass = () => {
    if (prefs.fontSize === 'large') return 'text-lg';
    if (prefs.fontSize === 'extra-large') return 'text-xl';
    return 'text-base';
  };

  // Resposta visual padrão para cliques no painel: escala menor imediata e bordas nítidas
  const buttonBaseStyle = `px-5 py-3 font-bold rounded-xl border-2 transition-all duration-100 active:scale-95 active:translate-y-0.5 ${getFontSizeClass()}`;

  const getBtnStyle = (active: boolean) => {
    if (prefs.highContrast) {
      return active 
        ? `${buttonBaseStyle} bg-yellow-400 text-black border-black shadow-[0_0_0_3px_#facc15]` 
        : `${buttonBaseStyle} bg-black text-yellow-400 border-zinc-700 hover:bg-zinc-900`;
    }
    return active 
      ? `${buttonBaseStyle} bg-blue-600 text-white border-blue-700 shadow-md transform translate-y-px` 
      : `${buttonBaseStyle} bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300`;
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 text-left p-2">
      
      {/* SEÇÃO DA ESQUERDA: APARÊNCIA */}
      <div className="space-y-5">
        <div>
          <span className={`block font-bold mb-2 ${getFontSizeClass()}`}>Letra na Tela:</span>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => onChange({ ...prefs, fontSize: 'normal' })} className={getBtnStyle(prefs.fontSize === 'normal')}>Padrão Aa</button>
            <button type="button" onClick={() => onChange({ ...prefs, fontSize: 'large' })} className={getBtnStyle(prefs.fontSize === 'large')}>Grande Aa</button>
            <button type="button" onClick={() => onChange({ ...prefs, fontSize: 'extra-large' })} className={getBtnStyle(prefs.fontSize === 'extra-large')}>Muito Grande Aa</button>
          </div>
        </div>

        <div>
          <span className={`block font-bold mb-2 ${getFontSizeClass()}`}>Cores da Tela:</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => onChange({ ...prefs, highContrast: false })} className={getBtnStyle(!prefs.highContrast)}>🎨 Cores Normais</button>
            <button type="button" onClick={() => onChange({ ...prefs, highContrast: true })} className={getBtnStyle(prefs.highContrast)}>⚫ Alto Contraste</button>
          </div>
        </div>

        <div>
          <span className={`block font-bold mb-2 ${getFontSizeClass()}`}>Espaço entre os elementos:</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => onChange({ ...prefs, spacing: 'normal' })} className={getBtnStyle(prefs.spacing === 'normal')}>Normal</button>
            <button type="button" onClick={() => onChange({ ...prefs, spacing: 'wide' })} className={getBtnStyle(prefs.spacing === 'wide')}>Mais Espaço</button>
          </div>
        </div>
      </div>

      {/* SEÇÃO DA DIREITA: SEGURANÇA E NOTIFICAÇÕES */}
      <div className="space-y-5">
        <div>
          <span className={`block font-bold mb-2 ${getFontSizeClass()}`}>Modo de Navegação e Segurança:</span>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => onChange({ ...prefs, simplifiedMode: !prefs.simplifiedMode })} className={getBtnStyle(prefs.simplifiedMode)}>
              {prefs.simplifiedMode ? '✨ Modo Simplificado Ligado' : '✨ Usar Modo Simplificado'}
            </button>
            <button type="button" onClick={() => onChange({ ...prefs, extraConfirmation: !prefs.extraConfirmation })} className={getBtnStyle(prefs.extraConfirmation)}>
              {prefs.extraConfirmation ? '🔒 Avisos de Segurança Ativos' : '🔒 Ativar Avisos de Segurança'}
            </button>
          </div>
        </div>

        <div>
          <span className={`block font-bold mb-2 ${getFontSizeClass()}`}>Lembretes de Estudo:</span>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => onChange({ ...prefs, reminderFrequency: 'none' })} className={getBtnStyle(prefs.reminderFrequency === 'none')}>Não avisar</button>
            <button type="button" onClick={() => onChange({ ...prefs, reminderFrequency: 'daily' })} className={getBtnStyle(prefs.reminderFrequency === 'daily')}>Todo Dia 📅</button>
            <button type="button" onClick={() => onChange({ ...prefs, reminderFrequency: 'weekly' })} className={getBtnStyle(prefs.reminderFrequency === 'weekly')}>Toda Semana 🗓️</button>
          </div>
        </div>
      </div>

    </div>
  );
}