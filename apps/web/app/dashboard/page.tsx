'use client';

import { useRouter } from 'next/navigation';
import { AccessibilityPreferences } from '../../src/components/AccessibilityPanel';

interface DashboardPageProps {
  prefs?: AccessibilityPreferences;
  userName?: string;
}

// Banco de dados centralizado e consistente com o Mobile
const COURSES_DATA = [
  {
    id: 'informatica-basica',
    title: '💻 Introdução à Informática',
    description: 'Aprenda a mexer no computador, organizar arquivos, usar pastas e navegar na internet com total segurança.',
    lessonsCount: 8,
    progress: 40,
  },
  {
    id: 'portal-academico',
    title: '🎓 Portal Acadêmico FIAP',
    description: 'Guia prático para você assistir suas aulas, ver suas notas e conversar com os professores sem complicações.',
    lessonsCount: 5,
    progress: 0,
  },
  {
    id: 'seguranca-digital',
    title: '🔒 Segurança na Internet',
    description: 'Evite golpes virtuais, aprenda a identificar mensagens falsas e proteja suas senhas no dia a dia.',
    lessonsCount: 6,
    progress: 85,
  }
];

export default function DashboardPage({ prefs, userName = 'Estudante' }: DashboardPageProps) {
  const router = useRouter();

  // Valores de fallback seguros para evitar quebras se o layout pai atrasar a carga
  const currentPrefs = prefs || {
    fontSize: 'normal',
    highContrast: false,
    spacing: 'normal',
    simplifiedMode: false,
    extraConfirmation: false
  };

  // 📐 Escalonamento tipográfico proporcional (Pertinente ao Web)
  const getTitleSizeClass = () => {
    if (currentPrefs.fontSize === 'large') return 'text-4xl';
    if (currentPrefs.fontSize === 'extra-large') return 'text-5xl';
    return 'text-3xl';
  };

  const getFontSizeClass = () => {
    if (currentPrefs.fontSize === 'large') return 'text-xl';
    if (currentPrefs.fontSize === 'extra-large') return 'text-2xl';
    return 'text-lg';
  };

  // 🎨 Definição temática baseada no Alto Contraste
  const theme = {
    cardBg: currentPrefs.highContrast ? 'bg-black border-yellow-400 text-yellow-400' : 'bg-white border-slate-200 text-slate-800',
    textMuted: currentPrefs.highContrast ? 'text-yellow-300' : 'text-slate-600',
    barBg: currentPrefs.highContrast ? 'bg-zinc-800 border-yellow-400' : 'bg-slate-100 border-slate-200',
    barFill: currentPrefs.highContrast ? 'bg-yellow-400' : 'bg-blue-600',
    btn: currentPrefs.highContrast ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
  };

  const handleCourseClick = (courseId: string, courseTitle: string) => {
    if (currentPrefs.extraConfirmation) {
      const confirmar = window.confirm(`Deseja mesmo entrar nas aulas de:\n"${courseTitle}"?`);
      if (!confirmar) return;
    }
    router.push(`/dashboard/courses/${courseId}`);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto ${currentPrefs.spacing === 'wide' ? 'space-y-12' : 'space-y-6'}`}>
      
      {/* 🔝 CABEÇALHO IDÊNTICO AO MOBILE (ADAPTADO À LARGURA DA WEB) */}
      <div className={`pb-6 border-b-4 ${currentPrefs.highContrast ? 'border-yellow-400' : 'border-slate-100'}`}>
        <h1 className={`${getTitleSizeClass()} font-extrabold tracking-tight`}>
          Olá, {userName}! 👋
        </h1>
        <p className={`${getFontSizeClass()} mt-2 opacity-90`}>
          Seja bem-vindo ao seu painel de estudos. Escolha um dos temas abaixo para iniciar sua aula:
        </p>
      </div>

      {/* 📚 LISTAGEM EM GRID RESPONSIVO (3 colunas em desktops, 1 em telas pequenas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COURSES_DATA.map((course) => (
          <div
            key={course.id}
            className={`rounded-2xl border-4 shadow-md flex flex-col justify-between transition-all duration-200 ${theme.cardBg} ${
              currentPrefs.spacing === 'wide' ? 'p-8 gap-8' : 'p-6 gap-4'
            }`}
          >
            {/* Bloco de Informações */}
            <div className="space-y-3">
              <h2 className={`font-bold leading-tight ${currentPrefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}>
                {course.title}
              </h2>
              
              {/* Oculta textos longos e descrições se o "Modo Simplificado" estiver ativo */}
              {!currentPrefs.simplifiedMode ? (
                <p className={`${getFontSizeClass()} leading-relaxed opacity-85`}>
                  {course.description}
                </p>
              ) : (
                <div className="py-1 border-b border-dashed border-zinc-700 opacity-40" />
              )}

              <span className={`inline-block font-semibold ${theme.textMuted} ${getFontSizeClass()}`}>
                📋 Contém {course.lessonsCount} aulas curtas
              </span>
            </div>

            {/* PROGRESSO EM BARRA ACESSÍVEL */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center font-bold">
                <span className={getFontSizeClass()}>
                  {course.progress === 0 ? '🚫 Não iniciado' : course.progress === 100 ? '✅ Concluído!' : '⏳ No meio'}
                </span>
                <span className={getFontSizeClass()}>{course.progress}%</span>
              </div>
              <div className={`w-full h-7 rounded-full overflow-hidden border-2 shadow-inner ${theme.barBg}`}>
                <div 
                  className={`h-full transition-all duration-500 ${theme.barFill}`} 
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            {/* BOTÃO MASSIVO DE TOQUE/CLIQUE */}
            <button
              onClick={() => handleCourseClick(course.id, course.title)}
              className={`w-full mt-4 py-4 rounded-xl font-bold transition-transform active:scale-[0.98] border-2 shadow-md ${theme.btn} ${
                currentPrefs.fontSize === 'normal' ? 'text-xl' : 'text-2xl'
              }`}
            >
              Entrar no Curso ➔
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}