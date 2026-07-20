'use client';

import { useEffect, useState } from 'react';
// 🌟 IMPORTANTE: Puxamos o auth e o db locais da Web
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { inicializarPerfilE_Tarefas } from '@seniorease/domain';
import { useRouter } from 'next/navigation';

// 🌟 Mesmo formato de preferências usado na tela de boas-vindas (app/page.tsx).
// Como esta rota fica FORA do AccessibilityProvider (que exige usuário logado),
// lemos aqui o que foi salvo em 'pre_prefs' para manter a mesma aparência
// (fonte grande, alto contraste, espaçamento) que o usuário já escolheu.
interface LocalPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
}

const DEFAULT_LOCAL_PREFS: LocalPreferences = {
  fontSize: 'normal',
  highContrast: false,
  spacing: 'normal',
};

export default function WebAuthPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<LocalPreferences>(DEFAULT_LOCAL_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pre_prefs');
      if (stored) setPrefs({ ...DEFAULT_LOCAL_PREFS, ...JSON.parse(stored) });
    } catch {
      // se der ruim ao ler, seguimos com o padrão sem travar a tela
    }
  }, []);

  const getFontSize = (type: 'title' | 'label' | 'input' | 'button') => {
    const modifier = prefs.fontSize === 'extra-large' ? 8 : prefs.fontSize === 'large' ? 4 : 0;
    if (type === 'title') return 28 + modifier;
    if (type === 'button') return 20 + modifier;
    return 18 + modifier;
  };

  const theme = {
    pageBg: prefs.highContrast ? '#000000' : '#f8fafc',
    card: prefs.highContrast ? '#121212' : '#ffffff',
    border: prefs.highContrast ? '#facc15' : '#cbd5e1',
    text: prefs.highContrast ? '#facc15' : '#1e293b',
    inputBg: prefs.highContrast ? '#1c1c1c' : '#ffffff',
    btnPrimaryBg: prefs.highContrast ? '#facc15' : '#2563eb',
    btnPrimaryText: prefs.highContrast ? '#000000' : '#ffffff',
    errorBg: prefs.highContrast ? '#3f1d1d' : '#fee2e2',
    errorText: prefs.highContrast ? '#ffb4b4' : '#ef4444',
  };

  const cardGap = prefs.spacing === 'wide' ? '22px' : '16px';
  const fieldPadding = prefs.spacing === 'wide' ? '18px' : '14px';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegistering && (!name || !selectedCourse)) {
      setError('Por favor, preencha seu nome e escolha uma turma.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 🌟 Recupera as preferências que o usuário ajustou ANTES de criar a conta
        // (salvas na tela de boas-vindas em 'pre_prefs'). Sem isso, o cadastro
        // sempre voltava para o padrão e o ajuste de letra/contraste era perdido.
        let initialPrefs;
        try {
          const stored = localStorage.getItem('pre_prefs');
          if (stored) initialPrefs = JSON.parse(stored);
        } catch (parseError) {
          console.warn('Não foi possível ler as preferências salvas antes do cadastro:', parseError);
        }

        // 🌟 INVERSÃO DE DEPENDÊNCIA APLICADA NA WEB: Injeta o 'db' da Web
        await inicializarPerfilE_Tarefas(db, userCredential.user.uid, name, email, selectedCourse, initialPrefs);

        localStorage.removeItem('pre_prefs');

        alert('Conta criada com sucesso! Suas atividades personalizadas já estão prontas.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError('Verifique suas credenciais ou se os dados cumprem o tamanho mínimo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '500px', padding: '24px', backgroundColor: theme.card, borderRadius: '16px', border: `3px solid ${theme.border}` }}>
        <h1 style={{ fontSize: `${getFontSize('title')}px`, color: theme.text, textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
          {isRegistering ? '📝 Criar Nova Conta' : '👋 Entrar no SeniorEase'}
        </h1>

        {error && (
          <p style={{ color: theme.errorText, backgroundColor: theme.errorBg, padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: `${getFontSize('label')}px` }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: cardGap }}>
          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: `${getFontSize('label')}px`, color: theme.text }}>Seu Nome Completo:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: fieldPadding, fontSize: `${getFontSize('input')}px`, borderRadius: '8px', border: `2px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} placeholder="Digite seu nome" />
            </div>
          )}

          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: `${getFontSize('label')}px`, color: theme.text }}>
                Escolha a sua Turma: <span style={{ color: theme.errorText }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedCourse('tecnologia-iniciantes')} style={{ padding: fieldPadding, fontSize: `${getFontSize('input')}px`, textAlign: 'left', borderRadius: '12px', border: '2px solid', borderColor: selectedCourse === 'tecnologia-iniciantes' ? theme.btnPrimaryBg : theme.border, backgroundColor: selectedCourse === 'tecnologia-iniciantes' ? (prefs.highContrast ? '#332b00' : '#e0f2fe') : theme.inputBg, color: theme.text, cursor: 'pointer', fontWeight: 'bold' }}>
                  {selectedCourse === 'tecnologia-iniciantes' ? '🟢 ' : '⚪ '} Tecnologia para Iniciantes
                </button>
                <button type="button" onClick={() => setSelectedCourse('smartphone-whatsapp')} style={{ padding: fieldPadding, fontSize: `${getFontSize('input')}px`, textAlign: 'left', borderRadius: '12px', border: '2px solid', borderColor: selectedCourse === 'smartphone-whatsapp' ? theme.btnPrimaryBg : theme.border, backgroundColor: selectedCourse === 'smartphone-whatsapp' ? (prefs.highContrast ? '#332b00' : '#e0f2fe') : theme.inputBg, color: theme.text, cursor: 'pointer', fontWeight: 'bold' }}>
                  {selectedCourse === 'smartphone-whatsapp' ? '🟢 ' : '⚪ '} Uso do Smartphone e Whatsapp
                </button>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: `${getFontSize('label')}px`, color: theme.text }}>E-mail:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: fieldPadding, fontSize: `${getFontSize('input')}px`, borderRadius: '8px', border: `2px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} placeholder="exemplo@email.com" required />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: `${getFontSize('label')}px`, color: theme.text }}>Senha:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: fieldPadding, fontSize: `${getFontSize('input')}px`, borderRadius: '8px', border: `2px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} placeholder="Digite sua senha" required />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: theme.btnPrimaryBg, color: theme.btnPrimaryText, padding: '16px', borderRadius: '12px', fontSize: `${getFontSize('button')}px`, fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px', minHeight: '56px' }}>
            {loading ? 'Processando...' : isRegistering ? 'Confirmar meu Cadastro ➔' : 'Entrar Agora ➔'}
          </button>
        </form>

        <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: prefs.highContrast ? '#facc15' : '#2563eb', width: '100%', textAlign: 'center', marginTop: '20px', fontSize: `${getFontSize('label')}px`, textDecoration: 'underline', cursor: 'pointer' }}>
          {isRegistering ? 'Já possui conta? Clique para Entrar' : 'Não tem conta? Clique para se Cadastrar'}
        </button>
      </div>
    </div>
  );
}
