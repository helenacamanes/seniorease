'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { AuthValidator } from '@seniorease/domain';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha os dois campos abaixo.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // 1. Cria o usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Cria o documento do usuário no Firestore com as preferências padrão de acessibilidade
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          preferences: {
            fontSize: 'normal',       // normal, large, extra-large
            highContrast: false,     // true ou false
            simplifiedMode: false    // true ou false
          }
        });
      } else {
        // Se for apenas login, entra direto e o useEffect se encarrega do redirect
        await signInWithEmailAndPassword(auth, email, password);
      }

    } catch (error: any) {
      const friendlyMessage = AuthValidator.formatError(error.code);
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10 border border-slate-200">

        {/* Título com foco em leitura legível */}
        <h1 className="text-4xl font-bold text-slate-800 text-center mb-2">
          SeniorEase 🌟
        </h1>
        <p className="text-xl text-slate-600 text-center mb-8">
          {isRegistering ? 'Preencha abaixo para criar seu cadastro rápido.' : 'Entre com seus dados para acessar o painel.'}
        </p>

        {errorMessage && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 text-lg p-4 rounded-xl mb-6 font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Input de E-mail ampliado */}
          <div>
            <label className="block text-xl font-medium text-slate-700 mb-2">Seu E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 text-xl border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
              placeholder="exemplo@email.com"
            />
          </div>

          {/* Input de Senha ampliado */}
          <div>
            <label className="block text-xl font-medium text-slate-700 mb-2">Sua Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 text-xl border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
              placeholder="Digite aqui..."
            />
          </div>

          {/* Botão Massivo de Ação Principal (Touch Target gigante) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold py-5 rounded-xl shadow-md transition-colors active:scale-[0.99]"
          >
            {loading ? 'Carregando...' : isRegistering ? 'Concluir Meu Cadastro' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Alternador de fluxo invisivelmente simples */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
            }}
            className="text-blue-600 hover:text-blue-800 text-lg font-semibold underline decoration-2 underline-offset-4"
          >
            {isRegistering ? 'Já tenho uma conta, quero apenas entrar' : 'Ainda não tenho conta, quero me cadastrar'}
          </button>
        </div>

      </div>
    </main>
  );
}