'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '../../src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // Lê se veio para login ou registro

  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userClass, setUserClass] = useState('informatica-basica');
  const [isRegistering, setIsRegistering] = useState(mode === 'register');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌟 Estados de Acessibilidade herdados da primeira tela
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Carrega as configurações feitas na página inicial
  useEffect(() => {
    const savedFontSize = localStorage.getItem('pre_fontSize');
    const savedContrast = localStorage.getItem('pre_highContrast');
    
    if (savedFontSize) setFontSize(savedFontSize as any);
    if (savedContrast) setHighContrast(savedContrast === 'true');
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (isRegistering && !name.trim()) {
      setErrorMessage('Por favor, digite o seu nome para continuarmos.');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setErrorMessage('Por favor, preencha os dois campos abaixo.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🌟 Grava em definitivo as escolhas herdadas no banco Firestore do usuário
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: name,
          email: user.email,
          class: userClass,
          createdAt: serverTimestamp(),
          preferences: {
            fontSize: fontSize,
            highContrast: highContrast,
            simplifiedMode: false
          }
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-2xl';
    if (fontSize === 'extra-large') return 'text-3xl';
    return 'text-xl';
  };

  const getPageBackground = () => highContrast ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-800';
  const getCardBackground = () => highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200';
  const getInputClass = () => highContrast 
    ? 'bg-black border-yellow-400 text-yellow-400 focus:border-white' 
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600';

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${getPageBackground()}`}>
      <div className={`w-full max-w-xl rounded-2xl shadow-xl p-10 border-2 ${getCardBackground()}`}>
        
        <h1 className={`text-4xl font-bold text-center mb-2`}>SeniorEase 🌟</h1>
        <p className={`${getFontSizeClass()} text-center mb-8 opacity-90`}>
          {isRegistering ? 'Preencha abaixo para criar seu cadastro rápido.' : 'Entre com seus dados para acessar o painel.'}
        </p>

        {errorMessage && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 text-lg p-4 rounded-xl mb-6 font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegistering && (
            <>
              <div>
                <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Seu Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-4 border-2 rounded-xl focus:outline-none ${getFontSizeClass()} ${getInputClass()}`}
                  placeholder="Como quer ser chamado?"
                />
              </div>

              <div>
                <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Escolha seu Curso:</label>
                <select
                  value={userClass}
                  onChange={(e) => setUserClass(e.target.value)}
                  className={`w-full p-4 border-2 rounded-xl focus:outline-none ${getFontSizeClass()} ${getInputClass()}`}
                  style={{ minHeight: '60px' }}
                >
                  <option value="informatica-basica">💻 Introdução à Informática</option>
                  <option value="portal-academico">🎓 Como Usar o Portal Acadêmico FIAP</option>
                  <option value="smartphones">📱 Dominando o Celular</option>
                  <option value="seguranca-digital">🔒 Segurança na Internet</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Seu E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none ${getFontSizeClass()} ${getInputClass()}`}
              placeholder="exemplo@email.com"
            />
          </div>

          <div>
            <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Sua Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none ${getFontSizeClass()} ${getInputClass()}`}
              placeholder="Digite aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-xl font-bold shadow-md ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-600 text-white'
            } ${fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}
          >
            {loading ? 'Carregando...' : isRegistering ? 'Concluir Meu Cadastro' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
            }}
            className={`font-semibold underline decoration-2 underline-offset-4 ${
              highContrast ? 'text-yellow-400' : 'text-blue-600'
            } ${fontSize === 'normal' ? 'text-lg' : 'text-xl'}`}
          >
            {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
          </button>
        </div>

      </div>
    </main>
  );
}