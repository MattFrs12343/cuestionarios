import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function TeamsIndex({ auth, teams }) {
    const { t } = useTranslation();
    
    const deleteTeam = (team) => {
        if (confirm(t('admin.teams.confirm_delete'))) {
            router.delete(route('admin.teams.destroy', team.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.teams.title')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gerenciamento de Equipes
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('admin.teams.title')} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        <div className="p-6">
                            {/* Header con botón crear */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></span>
                                        {t('admin.teams.list')}
                                    </h3>
                                </div>
                                <Link
                                    href={route('admin.teams.create')}
                                    className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 hover:from-purple-600 hover:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {t('admin.teams.create')}
                                </Link>
                            </div>

                            {/* Tabla de equipos */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Nome da Equipe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {t('admin.teams.members')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Data de Criação
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {teams && teams.length > 0 ? (
                                            teams.map((team, index) => (
                                                <tr key={team.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {team.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">{team.users_count || 0} membros</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                                                            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium">{formatDateTime(team.created_at)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.teams.show', team.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-900/20 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title={t('common.view')}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link
                                                                href={route('admin.teams.edit', team.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title={t('common.edit')}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteTeam(team)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title={t('common.delete')}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                        Nenhuma equipe encontrada
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Não há equipes registradas no sistema.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}