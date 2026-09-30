import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import QuestionnaireTypeIcon from '@/Components/QuestionnaireTypeIcon';
import GalaxyBackground from '@/Components/GalaxyBackground';
import ThemeToggle from '@/Components/ThemeToggle';
import Dropdown from '@/Components/Dropdown';
import TeamSelectionModal from '@/Components/TeamSelectionModal';
import { useTranslation } from '@/Hooks/useTranslation';
import heroBrain from '@/Assets/dashboard/hero-brain.png';

// Gradiente propio de cada tipo, alineado con la identidad visual que ya tiene
// cada formulário (ex.: Dinamômetro é violeta, Estesiometria é vermelho, etc.).
const GRADIENTS = {
    blue: { gradient: 'from-blue-500 to-blue-600', darkGradient: 'dark:from-blue-600 dark:to-blue-700' },
    purple: { gradient: 'from-purple-500 to-indigo-600', darkGradient: 'dark:from-purple-600 dark:to-indigo-700' },
    green: { gradient: 'from-emerald-500 to-teal-600', darkGradient: 'dark:from-emerald-600 dark:to-teal-700' },
    orange: { gradient: 'from-orange-500 to-amber-600', darkGradient: 'dark:from-orange-600 dark:to-amber-700' },
    teal: { gradient: 'from-teal-500 to-cyan-600', darkGradient: 'dark:from-teal-600 dark:to-cyan-700' },
    yellow: { gradient: 'from-amber-500 to-amber-600', darkGradient: 'dark:from-amber-600 dark:to-amber-700' },
    red: { gradient: 'from-red-500 to-rose-600', darkGradient: 'dark:from-red-600 dark:to-rose-700' },
    pink: { gradient: 'from-pink-500 to-fuchsia-600', darkGradient: 'dark:from-pink-600 dark:to-fuchsia-700' },
    indigo: { gradient: 'from-indigo-500 to-blue-600', darkGradient: 'dark:from-indigo-600 dark:to-blue-700' },
    violet: { gradient: 'from-violet-500 to-purple-600', darkGradient: 'dark:from-violet-600 dark:to-purple-700' },
    sky: { gradient: 'from-sky-500 to-blue-600', darkGradient: 'dark:from-sky-600 dark:to-blue-700' },
};

// Agrupamento por especialidade — ajuda a escanear a tela rapidamente
// mesmo com muitos tipos de questionário disponíveis.
const CATEGORIES = [
    { title: 'Exames Neurológicos', icons: ['electroencefalograma', 'electroneuromiografia', 'potencial', 'electroneuromiografia_facial'] },
    { title: 'Avaliações e Testes Especiais', icons: ['rastreio_cognitivo', 'equilibrio', 'mini_exame_mental', 'estesiometria', 'dinamometro'] },
    { title: 'TDAH', icons: ['tdah_infantil', 'tdah_adulto'] },
];

function getColorName(bgClass) {
    const match = /bg-([a-z]+)-\d+/.exec(bgClass || '');
    return match ? match[1] : 'blue';
}

function groupModules(modules) {
    const remaining = new Set(modules.map((m) => m.icon));
    const groups = CATEGORIES.map((cat) => ({
        title: cat.title,
        items: cat.icons
            .map((icon) => modules.find((m) => m.icon === icon))
            .filter(Boolean),
    })).filter((g) => g.items.length > 0);

    groups.forEach((g) => g.items.forEach((i) => remaining.delete(i.icon)));

    const rest = modules.filter((m) => remaining.has(m.icon));
    if (rest.length > 0) groups.push({ title: 'Outros', items: rest });

    return groups;
}

function CategoryIcon({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );
}

const ModuleCard = ({ type }) => {
    const colors = GRADIENTS[getColorName(type.color)] || GRADIENTS.blue;
    return (
        <Link
            href={type.href}
            className={`group relative flex flex-col justify-between bg-gradient-to-br ${colors.gradient} ${colors.darkGradient} rounded-2xl shadow-lg hover:shadow-xl p-5 text-white transition-all duration-200 hover:-translate-y-1 min-h-[132px]`}
        >
            <div className="flex items-start justify-between">
                <div className="bg-white/20 rounded-xl p-2.5 flex-shrink-0">
                    <QuestionnaireTypeIcon type={type.icon} className="w-6 h-6 text-white" />
                </div>
                <svg className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
            <div className="mt-4 min-w-0">
                <h4 className="text-base font-bold text-white truncate">{type.name}</h4>
                <p className="text-white/85 text-xs mt-1 line-clamp-2">{type.description}</p>
            </div>
        </Link>
    );
};

function DashboardHeader({ user, userRole, isAdmin }) {
    const { t } = useTranslation();
    const searchRef = useRef(null);
    const { props } = usePage();
    const switchableTeams = props.switchableTeams || [];
    const canSwitchTeams = switchableTeams.length > 1;
    const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex items-center gap-3 mb-6">
            <TeamSelectionModal
                show={showTeamSwitcher}
                teams={switchableTeams}
                closeable
                onClose={() => setShowTeamSwitcher(false)}
            />
            <div className="relative flex-1 max-w-xl">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8.5" strokeWidth="1.5" />
                </svg>
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Buscar paciente, exame ou documento..."
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md text-sm text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200"
                />
                <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[11px] font-medium text-gray-400 dark:text-zinc-400 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
                    Ctrl + K
                </kbd>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <ThemeToggle />

                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow">
                                <span className="text-sm font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="hidden md:block text-left">
                                <span className="block text-sm font-semibold text-gray-800 dark:text-zinc-100 leading-tight">{user.name}</span>
                                {userRole && (
                                    <span className="block text-xs text-gray-500 dark:text-zinc-400 leading-tight capitalize">{userRole}</span>
                                )}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content className="w-56 rounded-2xl shadow-2xl bg-white/95 dark:bg-zinc-700/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 dark:ring-zinc-600 border border-gray-200/50 dark:border-zinc-600/50">
                        <div className="py-2">
                            <Dropdown.Link
                                href={route('profile.edit')}
                                className="block px-5 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl mx-2 transition-colors duration-150"
                            >
                                {t('navigation.profile')}
                            </Dropdown.Link>
                            {canSwitchTeams && (
                                <button
                                    type="button"
                                    onClick={() => setShowTeamSwitcher(true)}
                                    className="block w-full text-left px-5 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl mx-2 transition-colors duration-150"
                                >
                                    Cambiar equipo
                                </button>
                            )}
                            {isAdmin && (
                                <Dropdown.Link
                                    href={route('admin.dashboard')}
                                    className="block px-5 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-xl mx-2 transition-colors duration-150"
                                >
                                    {t('navigation.admin')}
                                </Dropdown.Link>
                            )}
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block w-full text-left px-5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mx-2 transition-colors duration-150"
                            >
                                {t('auth.logout')}
                            </Dropdown.Link>
                        </div>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </div>
    );
}

function HeroBanner() {
    return (
        <div className="relative overflow-hidden rounded-2xl shadow-xl mb-4 min-h-[220px] sm:min-h-[260px] bg-[#0a1128]">
            {/* Imagen de fondo a pantalla completa */}
            <img
                src={heroBrain}
                alt=""
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
            {/* Difuminado: la foto se funde con la card en todos los bordes */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1128] via-[#0a1128]/80 to-transparent" />
            <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(130% 110% at 68% 45%, transparent 35%, #0a1128 95%)' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 min-h-[220px] sm:min-h-[260px]">
                <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11.3 1.046A1 1 0 0112 2v6h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 19v-6H4a1 1 0 01-.82-1.573l7-10a1 1 0 01.98-.38z" />
                        </svg>
                        Bem-vindo
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-md">
                        Painel <span className="text-blue-300 font-semibold">de</span> Exames{' '}
                        <span className="text-blue-400">Neurológicos</span>
                    </h1>
                    <p className="text-blue-100/80 text-sm sm:text-base max-w-md drop-shadow">
                        Acesse rapidamente os protocolos, avalie e registre as informações dos seus pacientes.
                    </p>
                </div>

                <div className="hidden lg:flex flex-col items-end flex-shrink-0 max-w-[200px] text-right gap-2 bg-black/10 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="italic text-blue-100 text-sm leading-snug">
                        &ldquo;Uma melhor avaliação, melhores decisões.&rdquo;
                    </p>
                    <svg className="w-16 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 64 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10h10l4-8 6 16 4-11 3 6h33" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default function QuestionnairesIndex({ auth, modules = [], userRole, isAdmin }) {
    const groups = groupModules(modules);

    return (
        <AuthenticatedLayout user={auth.user} hideNav>
            <Head title="Questionários" />

            <div className="relative py-6 min-h-screen">
                <GalaxyBackground constellations />
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <DashboardHeader user={auth.user} userRole={userRole} isAdmin={isAdmin} />

                    {modules.length > 0 ? (
                        <>
                            <HeroBanner />

                            <div className="flex justify-end mb-2">
                                <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 px-3 py-1.5 rounded-full">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M11.3 1.046A1 1 0 0112 2v6h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 19v-6H4a1 1 0 01-.82-1.573l7-10a1 1 0 01.98-.38z" />
                                    </svg>
                                    Acesso rápido aos protocolos mais utilizados
                                </span>
                            </div>

                            {groups.map((group) => (
                                <div key={group.title}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <CategoryIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                        <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 underline decoration-blue-400/50 dark:decoration-blue-500/50 underline-offset-4">
                                            {group.title}
                                        </h3>
                                    </div>
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${group.items.length > 2 ? 'lg:grid-cols-4' : 'lg:w-2/3'}`}>
                                        {group.items.map((type) => (
                                            <ModuleCard key={type.href} type={type} />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <details className="bg-white dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600 overflow-hidden">
                                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-600/50">
                                    Como funciona a gestão por equipes?
                                </summary>
                                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-zinc-400 space-y-1.5">
                                    <p>Os questionários estão organizados por equipes de trabalho — você só vê e gerencia os das equipes às quais pertence.</p>
                                    <p>Cada tipo tem campos e validações próprias, de acordo com o procedimento. O acesso a cada módulo é controlado por permissões.</p>
                                </div>
                            </details>
                        </>
                    ) : (
                        /* Estado sin módulos */
                        <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-xl dark:shadow-zinc-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-zinc-600 transition-colors duration-200">
                            <div className="p-6 sm:p-12 text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-3 sm:mb-4">
                                    {isAdmin ? 'Nenhum módulo configurado' : 'Sem acesso a módulos'}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mb-4 sm:mb-6 max-w-md mx-auto">
                                    {isAdmin
                                        ? 'Como administrador, você tem acesso a todos os módulos, mas não há módulos configurados no sistema.'
                                        : 'Você não tem acesso a nenhum módulo de questionários. Entre em contato com um administrador para solicitar acesso.'
                                    }
                                </p>
                                {!isAdmin && (
                                    <div className="bg-gray-50 dark:bg-zinc-600/50 p-3 sm:p-4 rounded-lg inline-block">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                                            Seu papel atual: <span className="font-medium text-gray-900 dark:text-zinc-100">{userRole || 'Sem papel asignado'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
