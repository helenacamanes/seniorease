'use client';

import { useRouter } from 'next/navigation';
import { AccessibilityPreferences } from '../../src/components/AccessibilityPanel';
import { useAccessibility } from '../../src/context/AccessibilityContext';

interface DashboardPageProps {
  prefs?: AccessibilityPreferences;
  userName?: string;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const { prefs, userName } = useAccessibility();

  // Mapeamento completo e seguro com os fallbacks corretos para evitar quebras
  const currentPrefs = {
    fontSize: prefs?.fontSize || 'normal',
    highContrast: prefs?.highContrast || false,
    spacing: prefs?.spacing || 'normal',
    simplifiedMode: prefs?.simplifiedMode || false,
    extraConfirmation: prefs?.extraConfirmation || false,
    reminderFrequency: prefs?.reminderFrequency || 'none'
  };

  // 📐 Escalonamento tipográfico proporcional
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
    // 🔒 MODO DE SEGURANÇA: Só dispara o confirm se a flag estiver explicitamente ativa
    if (currentPrefs.extraConfirmation) {
      const confirmar = window.confirm(`Deseja mesmo entrar nas aulas de:\n"${courseTitle}"?`);
      if (!confirmar) return;
    }
    router.push(`/dashboard/courses/${courseId}`);
  };

  return (
    // ↔️ ESPAÇAMENTO ENTRE ELEMENTOS: Aplica dinamicamente o recuo vertical maior no container
    <div className={`w-full max-w-7xl mx-auto transition-all ${currentPrefs.spacing === 'wide' ? 'space-y-16' : 'space-y-6'}`}>

      {/* Cabeçalho */}
      <div className={`pb-6 border-b-4 ${currentPrefs.highContrast ? 'border-yellow-400' : 'border-slate-100'}`}>
        <h1 className={`${getTitleSizeClass()} font-extrabold tracking-tight`}>
          Olá, {userName}! 👋
        </h1>
        <p className={`${getFontSizeClass()} mt-2 opacity-90`}>
          Seja bem-vindo ao seu painel de estudos. Escolha um dos temas abaixo para iniciar sua aula:
        </p>
      </div>

      {/* 📚 GRADE DE CURSOS - Ajustando o gap (espaço entre os botões/cards) com base na escolha do usuário */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all ${currentPrefs.spacing === 'wide' ? 'gap-12' : 'gap-6'
        }`}>
        {COURSES_DATA.map((course) => (
          <div
            key={course.id}
            className={`rounded-2xl border-4 shadow-md flex flex-col justify-between transition-all ${theme.cardBg} ${
              // ↔️ ESPAÇAMENTO INTERNO (PADDING) DO CARD AJUSTADO
              currentPrefs.spacing === 'wide' ? 'p-10 gap-10' : 'p-6 gap-4'
              }`}
          >
            {/* Bloco de Informações */}
            <div className={currentPrefs.spacing === 'wide' ? 'space-y-6' : 'space-y-3'}>
              <h2 className={`font-bold leading-tight ${currentPrefs.fontSize === 'normal' ? 'text-2xl' : 'text-3xl'}`}>
                {course.title}
              </h2>

              {/* ✨ MODO SIMPLIFICADO: Esconde completamente o bloco de descrição para remover a sobrecarga cognitiva */}
              {!currentPrefs.simplifiedMode ? (
                <p className={`${getFontSizeClass()} leading-relaxed opacity-85`}>
                  {course.description}
                </p>
              ) : (
                <div className="py-1 border-b border-dashed opacity-20" />
              )}

              <span className={`inline-block font-semibold ${theme.textMuted} ${getFontSizeClass()}`}>
                📋 Contém {course.lessonsCount} aulas curtas
              </span>
            </div>

            {/* Progresso */}
            <div className={currentPrefs.spacing === 'wide' ? 'space-y-4' : 'space-y-2'}>
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

            <button
              onClick={() => handleCourseClick(course.id, course.title)}
              className={`w-full py-4 rounded-xl font-bold border-2 shadow-md transition-all duration-100 ${theme.btn} ${currentPrefs.fontSize === 'normal' ? 'text-xl' : 'text-2xl'
                } ${
                // RESPOSTA VISUAL INDEPENDENTE E COERENTE:
                currentPrefs.highContrast
                  ? 'border-yellow-400 active:scale-95 active:bg-zinc-900 active:text-yellow-400'
                  : 'border-slate-900 hover:bg-slate-800 active:scale-95 active:bg-slate-950 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-1'
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