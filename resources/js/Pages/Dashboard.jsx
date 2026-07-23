import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Dashboard({ auth }) {
    const { t } = useTranslation();
    
    const quickActions = [
        {
            name: t('questionnaires.title'),
            description: 'Visualizar todos os questionários',
            href: route('questionnaires.index'),
            gradient: 'from-blue-500 to-blue-600',
            darkGradient: 'dark:from-blue-600 dark:to-blue-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ];

    // Adicionar ações condicionais baseadas nas permissões do usuário
    if (auth.user.roles && auth.user.roles.some(role => ['TECNICO', 'tecnico', 'usuario', 'gerente', 'administrador'].includes(role.name))) {
        quickActions.push(
            /* {
                name: 'Novo EEG',
                description: 'Criar questionário de Eletroencefalograma',
                href: route('questionnaires.electroencefalograma.create'),
                gradient: 'from-green-500 to-emerald-600',
                darkGradient: 'dark:from-green-600 dark:to-emerald-700',
                icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                )
            },
            {
                name: 'Novo EMG',
                description: 'Criar questionário de Eletroneuromiografia',
                href: route('questionnaires.electroneuromiografia.create'),
                gradient: 'from-purple-500 to-indigo-600',
                darkGradient: 'dark:from-purple-600 dark:to-indigo-700',
                icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                )
            } */
        );
    }

    quickActions.push({
        name: t('navigation.profile'),
        description: 'Gerenciar informações do perfil',
        href: route('profile.edit'),
        gradient: 'from-gray-500 to-gray-600',
        darkGradient: 'dark:from-gray-600 dark:to-gray-700',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    });
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('navigation.dashboard')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Sistema de Questionários Médicos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('navigation.dashboard')} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Banner de bienvenida 
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 sm:mr-5">
                                        <svg className="w-6 h-6 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                                            Bem-vindo, {auth.user.name}!
                                        </h1>
                                        <p className="text-blue-100 text-xs sm:text-sm">
                                            Sistema de Gestão de Questionários Médicos - Gerencie seus questionários com facilidade
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <svg className="w-32 h-32 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

                    {/* Cards de Ações Rápidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className={`bg-gradient-to-br ${action.gradient} ${action.darkGradient} rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 text-white transform hover:scale-105 transition-transform duration-200`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{action.name}</p>
                                        <p className="text-xs sm:text-sm mt-2 text-white/90">{action.description}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-2 sm:p-3">
                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {action.icon.props.children}
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Sección de Información y Accesos Rápidos */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Accesos Rápidos */}
                                {/* <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border-l-4 border-blue-500 dark:border-blue-400 transition-colors duration-200">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-5 flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Accesos Rápidos
                                    </h4>
                                    <div className="space-y-3">
                                        <Link
                                            href={route('questionnaires.index')}
                                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 group"
                                        >
                                            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Ver Todos os Questionários
                                        </Link>
                                        
                                        {auth.user.roles && auth.user.roles.some(role => ['TECNICO', 'tecnico', 'usuario', 'gerente', 'administrador'].includes(role.name)) && (
                                            <>
                                                <Link
                                                    href={route('questionnaires.electroencefalograma.index')}
                                                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-all duration-200 border border-green-200 dark:border-green-800 group"
                                                >
                                                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                    Questionários EEG
                                                </Link>
                                                <Link
                                                    href={route('questionnaires.electroneuromiografia.index')}
                                                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all duration-200 border border-purple-200 dark:border-purple-800 group"
                                                >
                                                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Questionários EMG
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div> */}

                                {/* Información del Usuario */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 sm:p-6 rounded-lg sm:rounded-xl border-l-4 border-indigo-500 dark:border-indigo-400 transition-colors duration-200">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-5 flex items-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Informações da Conta
                                    </h4>
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <div>
                                                <p className="font-medium">Usuário: {auth.user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user.email}</p>
                                            </div>
                                        </div>
                                        
                                        {auth.user.roles && auth.user.roles.length > 0 && (
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium">Funções:</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {auth.user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                                            >
                                                                {role.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {auth.user.teams && auth.user.teams.length > 0 && (
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium">Equipes:</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {auth.user.teams.map((team) => (
                                                            <span
                                                                key={team.id}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                                            >
                                                                {team.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
