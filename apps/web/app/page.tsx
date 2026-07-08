'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function LoginPage() {
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌟 Estados Locais de Acessibilidade (Reaproveitáveis antes do registro)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Monitora o estado de autenticação em tempo real para usuários já logados
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se o usuário já está logado, vai direto para o dashboard
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

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
    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Lógica de mapeamento de classes dinâmicas com base no estado de acessibilidade
  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-2xl';
    if (fontSize === 'extra-large') return 'text-3xl';
    return 'text-xl'; // normal
  };

  const getTitleSizeClass = () => {
    if (fontSize === 'large') return 'text-5xl';
    if (fontSize === 'extra-large') return 'text-6xl';
    return 'text-4xl'; // normal
  };

  const getPageBackground = () => highContrast ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-800';
  const getCardBackground = () => highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-200';
  const getInputClass = () => highContrast
    ? 'bg-black border-yellow-400 text-yellow-400 focus:border-white'
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600';

  const [userClass, setUserClass] = useState('informatica-basica');
  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200 ${getPageBackground()}`}>

      {/* 🌟 CONTAINER TEMPORÁRIO PARA TESTAR: Simulador do Painel de Acessibilidade 
          Quando criarmos o painel modular, ele substituirá esse bloco de botões abaixo! */}
      <div className={`mb-6 p-4 rounded-xl border-2 flex gap-4 items-center ${getCardBackground()}`}>
        <span className="font-bold">Ajuste Rápido (Teste):</span>
        <button type="button" onClick={() => setFontSize('normal')} className="px-3 py-1 bg-blue-500 text-white rounded">A</button>
        <button type="button" onClick={() => setFontSize('large')} className="px-3 py-1 bg-blue-500 text-white rounded text-lg">A+</button>
        <button type="button" onClick={() => setFontSize('extra-large')} className="px-3 py-1 bg-blue-500 text-white rounded text-xl">A++</button>
        <button type="button" onClick={() => setHighContrast(!highContrast)} className="px-3 py-1 bg-amber-500 text-black font-bold rounded">Contraste</button>
      </div>

      <div className={`w-full max-w-xl rounded-2xl shadow-xl p-10 border-2 transition-all duration-200 ${getCardBackground()}`}>

        <h1 className={`${getTitleSizeClass()} font-bold text-center mb-2`}>
          SeniorEase 🌟
        </h1>
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
            <div>
              <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Seu Nome:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all ${getFontSizeClass()} ${getInputClass()}`}
                placeholder="Como quer ser chamado?"
              />
            </div>
          )}

          {isRegistering && (
            <div>
              <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Sua turma:</label>
              <select
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all ${getFontSizeClass()} ${getInputClass()}`}
              >
                <option value="informatica-basica">💻 Introdução à Informática Básica</option>
                <option value="portal-academico">🎓 Como Usar o Portal Acadêmico FIAP</option>
                <option value="smartphones">📱 Dominando o Uso do Celular</option>
                <option value="seguranca-digital">🔒 Segurança e Proteção na Internet</option>
              </select>
            </div>)}

          <div>
            <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Seu E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all ${getFontSizeClass()} ${getInputClass()}`}
              placeholder="exemplo@email.com"
            />
          </div>

          <div>
            <label className={`block font-medium mb-2 ${getFontSizeClass()}`}>Sua Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-all ${getFontSizeClass()} ${getInputClass()}`}
              placeholder="Digite aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-xl font-bold shadow-md transition-all active:scale-[0.99] ${highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
              setName('');
            }}
            className={`font-semibold underline decoration-2 underline-offset-4 ${highContrast ? 'text-yellow-400 hover:text-white' : 'text-blue-600 hover:text-blue-800'
              } ${fontSize === 'normal' ? 'text-lg' : 'text-xl'}`}
          >
            {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
          </button>
        </div>

      </div>
    </main>
  );
}