import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function AdminDashboard({ auth, stats }) {
    const { t } = useTranslation();
    
    const dashboardStats = [
        {
            name: t('navigation.users'),
            value: stats?.users || '0',
            href: route('admin.users.index'),
            gradient: 'from-blue-500 to-blue-600',
            darkGradient: 'dark:from-blue-600 dark:to-blue-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: t('navigation.roles'),
            value: stats?.roles || '0',
            href: route('admin.roles.index'),
            gradient: 'from-green-500 to-emerald-600',
            darkGradient: 'dark:from-green-600 dark:to-emerald-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            name: t('navigation.teams'),
            value: stats?.teams || '0',
            href: route('admin.teams.index'),
            gradient: 'from-purple-500 to-indigo-600',
            darkGradient: 'dark:from-purple-600 dark:to-indigo-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            name: t('admin.users.active'),
            value: stats?.active_users || '0',
            href: route('admin.users.index'),
            gradient: 'from-teal-500 to-cyan-600',
            darkGradient: 'dark:from-teal-600 dark:to-cyan-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: 'Módulos',
            value: stats?.users_with_modules || '0',
            href: route('admin.user-modules.index'),
            gradient: 'from-orange-500 to-red-600',
            darkGradient: 'dark:from-orange-600 dark:to-red-700',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            )
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.dashboard')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Painel Administrativo
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('admin.dashboard')} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Banner de bienvenida 
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-5">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-1">
                                            Bem-vindo ao Painel Administrativo
                                        </h1>
                                        <p className="text-orange-100 text-sm">
                                            Gerencie usuários, funções e equipes do sistema com facilidade
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <svg className="w-32 h-32 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

                    {/* Cards de Estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {dashboardStats.map((stat) => (
                            <Link
                                key={stat.name}
                                href={stat.href}
                                className={`bg-gradient-to-br ${stat.gradient} ${stat.darkGradient} rounded-xl shadow-lg p-5 text-white transform hover:scale-105 transition-transform duration-200`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{stat.name}</p>
                                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-3">
                                        {stat.icon}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Secciones de Acciones Rápidas y Info */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ações Rápidas */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-6 rounded-xl border-l-4 border-orange-500 dark:border-orange-400 transition-colors duration-200">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Ações Rápidas
                                    </h4>
                                    <div className="space-y-3">
                                        <Link
                                            href={route('admin.users.create')}
                                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 group"
                                        >
                                            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            {t('admin.users.create')}
                                        </Link>
                                        <Link
                                            href={route('admin.roles.create')}
                                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-all duration-200 border border-green-200 dark:border-green-800 group"
                                        >
                                            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            {t('admin.roles.create')}
                                        </Link>
                                        <Link
                                            href={route('admin.teams.create')}
                                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-all duration-200 border border-purple-200 dark:border-purple-800 group"
                                        >
                                            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {t('admin.teams.create')}
                                        </Link>
                                    </div>
                                </div>

                                {/* Informações do Sistema */}
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 p-6 rounded-xl border-l-4 border-red-500 dark:border-red-400 transition-colors duration-200">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Informações do Sistema
                                    </h4>
                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>Como administrador você tem acesso completo ao sistema.</p>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>Você pode gerenciar usuários, atribuir funções e organizar equipes.</p>
                                        </div>
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>As alterações são refletidas imediatamente no sistema.</p>
                                        </div>
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