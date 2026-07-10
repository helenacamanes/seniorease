'use client';

import { useState } from 'react';
// 🌟 IMPORTANTE: Puxamos o auth e o db locais da Web
import { auth, db } from '@/lib/firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { inicializarPerfilE_Tarefas } from '@seniorease/domain';
import { useRouter } from 'next/navigation';

export default function WebAuthPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        
        // 🌟 INVERSÃO DE DEPENDÊNCIA APLICADA NA WEB: Injeta o 'db' da Web
        await inicializarPerfilE_Tarefas(db, userCredential.user.uid, name, email, selectedCourse);
        
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
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', border: '3px solid #cbd5e1' }}>
      <h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
        {isRegistering ? '📝 Criar Nova Conta' : '👋 Entrar no SeniorEase'}
      </h1>

      {error && <p style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isRegistering && (
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '18px' }}>Seu Nome Completo:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '18px', borderRadius: '8px', border: '2px solid #cbd5e1' }} placeholder="Digite seu nome" />
          </div>
        )}

        {isRegistering && (
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '18px' }}>
              Escolha a sua Turma: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="button" onClick={() => setSelectedCourse('tecnologia-iniciantes')} style={{ padding: '16px', fontSize: '18px', textAlign: 'left', borderRadius: '12px', border: '2px solid', borderColor: selectedCourse === 'tecnologia-iniciantes' ? '#2563eb' : '#cbd5e1', backgroundColor: selectedCourse === 'tecnologia-iniciantes' ? '#e0f2fe' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {selectedCourse === 'tecnologia-iniciantes' ? '🟢 ' : '⚪ '} Tecnologia para Iniciantes
              </button>
              <button type="button" onClick={() => setSelectedCourse('smartphone-whatsapp')} style={{ padding: '16px', fontSize: '18px', textAlign: 'left', borderRadius: '12px', border: '2px solid', borderColor: selectedCourse === 'smartphone-whatsapp' ? '#2563eb' : '#cbd5e1', backgroundColor: selectedCourse === 'smartphone-whatsapp' ? '#e0f2fe' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {selectedCourse === 'smartphone-whatsapp' ? '🟢 ' : '⚪ '} Uso do Smartphone e Whatsapp
              </button>
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '18px' }}>E-mail:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '18px', borderRadius: '8px', border: '2px solid #cbd5e1' }} placeholder="exemplo@email.com" required />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '18px' }}>Senha:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '18px', borderRadius: '8px', border: '2px solid #cbd5e1' }} placeholder="Digite sua senha" required />
        </div>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Processando...' : isRegistering ? 'Confirmar meu Cadastro ➔' : 'Entrar Agora ➔'}
        </button>
      </form>

      <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: '#2563eb', width: '100%', textAlign: 'center', marginTop: '20px', fontSize: '18px', textDecoration: 'underline', cursor: 'pointer' }}>
        {isRegistering ? 'Já possui conta? Clique para Entrar' : 'Não tem conta? Clique para se Cadastrar'}
      </button>
    </div>
  );
}