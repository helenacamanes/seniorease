'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta em tempo real se o usuário está logado ou não
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setLoading(false);
      } else {
        // Se não tiver usuário logado, expulsa de volta para o login
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Carregando Painel Acessível... 🌟</h2>
      </div>
    );
  }

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1>SeniorEase 🌟</h1>
          <p>Bem-vindo ao seu painel: <strong>{userEmail}</strong></p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Sair do Sistema
        </button>
      </header>

      <section style={{ padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '12px' }}>
        <h3>Próxima Parada: Configurações de Acessibilidade</h3>
        <p>Aqui vamos construir os botões gigantes para mudar as fontes e contrastes do idoso.</p>
      </section>
    </main>
  );
}