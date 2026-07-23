import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function QuestionnairesIndex({ auth, modules = [], userRole, isAdmin }) {

    // Mapear colores de gradiente para cada tipo de questionario
    const getGradientColors = (color, index) => {
        const gradients = [
            { gradient: 'from-blue-500 to-blue-600', darkGradient: 'dark:from-blue-600 dark:to-blue-700' },
            { gradient: 'from-green-500 to-emerald-600', darkGradient: 'dark:from-green-600 dark:to-emerald-700' },
            { gradient: 'from-purple-500 to-indigo-600', darkGradient: 'dark:from-purple-600 dark:to-indigo-700' },
            { gradient: 'from-orange-500 to-red-600', darkGradient: 'dark:from-orange-600 dark:to-red-700' },
            { gradient: 'from-teal-500 to-cyan-600', darkGradient: 'dark:from-teal-600 dark:to-cyan-700' },
        ];
        return gradients[index % gradients.length];
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Questionários
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gestão de Questionários Médicos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Questionários" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Banner principal 
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl shadow-xl overflow-hidden">
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
                                            Tipos de Questionários
                                        </h1>
                                        <p className="text-green-100 text-xs sm:text-sm">
                                            Selecione o tipo de questionário que deseja gerenciar e visualizar
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <svg className="w-32 h-32 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

                    {modules.length > 0 ? (
                        <>
                            {/* Cards de tipos de questionários */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {modules.map((type, index) => {
                                    const colors = getGradientColors(type.color, index);
                                    return (
                                        <Link
                                            key={index}
                                            href={type.href}
                                            className={`bg-gradient-to-br ${colors.gradient} ${colors.darkGradient} rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200 group`}
                                        >
                                            {/* Layout móvil compacto */}
                                            <div className="sm:hidden">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <div className="bg-white/20 rounded-lg p-2 text-lg mr-3">
                                                            {type.icon}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-white">{type.name}</h4>
                                                            <p className="text-white/80 text-xs">{type.count} registros</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-white/90 text-sm mb-3">{type.description}</p>
                                                <div className="flex items-center text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                                                    Gerenciar
                                                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Layout tablet/desktop */}
                                            <div className="hidden sm:block">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="bg-white/20 rounded-lg p-3 text-2xl">
                                                        {type.icon}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Registros</p>
                                                        <p className="text-2xl font-bold">{type.count}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-white mb-2">{type.name}</h4>
                                                    <p className="text-white/90 text-sm mb-4">{type.description}</p>
                                                    <div className="flex items-center text-white/90 text-sm font-medium group-hover:text-white transition-colors">
                                                        Gerenciar questionários
                                                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Sección de información */}
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Información sobre questionários */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border-l-4 border-green-500 dark:border-green-400 transition-colors duration-200">
                                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-5 flex items-center">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                O que são os questionários?
                                            </h4>
                                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Formulários especializados para diferentes tipos de exames médicos.</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Cada tipo possui campos e validações específicas de acordo com o procedimento.</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Organizados por especialidade médica para melhor gestão.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gestão por equipes */}
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 p-4 sm:p-6 rounded-lg sm:rounded-xl border-l-4 border-emerald-500 dark:border-emerald-400 transition-colors duration-200">
                                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-5 flex items-center">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Gestão por Equipes
                                            </h4>
                                            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Os questionários estão organizados por equipes de trabalho.</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Você só pode ver e gerenciar os questionários das equipes às quais pertence.</p>
                                                </div>
                                                <div className="flex items-start">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p>Controle de acesso baseado em permissões e módulos.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Estado sin módulos */
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                            <div className="p-6 sm:p-12 text-center">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                                    {isAdmin ? 'Nenhum módulo configurado' : 'Sem acesso a módulos'}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                                    {isAdmin
                                        ? 'Como administrador, você tem acesso a todos os módulos, mas não há módulos configurados no sistema.'
                                        : 'Você não tem acesso a nenhum módulo de questionários. Entre em contato com um administrador para solicitar acesso.'
                                    }
                                </p>
                                {!isAdmin && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg inline-block">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Seu papel atual: <span className="font-medium text-gray-900 dark:text-gray-100">{userRole || 'Sem papel asignado'}</span>
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