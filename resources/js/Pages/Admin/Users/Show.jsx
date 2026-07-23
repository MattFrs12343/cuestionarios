import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function ShowUser({ auth, user }) {
    const { t } = useTranslation();
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.users.view')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gerenciamento de Usuários
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`${t('admin.users.view')}: ${user.name}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Usuário */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                        <p className="text-indigo-100 text-sm mt-1">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.users.edit', user.id)}
                                        className="inline-flex items-center bg-white hover:bg-gray-50 text-indigo-600 dark:text-indigo-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        {t('common.edit')}
                                    </Link>
                                    <Link
                                        href={route('admin.users.index')}
                                        className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        {t('common.back')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Personal */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Pessoais</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.users.name')}</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.users.email')}</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{user.phone || 'Não especificado'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{user.address || 'Não especificado'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.users.status')}</label>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.is_active 
                                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                                                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                            }`}>
                                                {user.is_active ? t('admin.users.active') : t('admin.users.inactive')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del Sistema */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações do Sistema</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Registro</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {formatDateTime(user.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Atualização</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {formatDateTime(user.updated_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Último Login</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {user.last_login_at 
                                                    ? formatDateTime(user.last_login_at)
                                                    : 'Nunca'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Funções Atribuídas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                >
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Sem funções atribuídas</p>
                                        )}
                                    </div>
                                </div>

                                {/* Equipos */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Equipes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.teams && user.teams.length > 0 ? (
                                            user.teams.map((team) => (
                                                <span
                                                    key={team.id}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                                                >
                                                    {team.name}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Sem equipes atribuídas</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas de Cuestionarios */}
                            {(user.created_questionnaires || user.edited_questionnaires) && (
                                <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Atividade em Questionários</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Questionários Criados</label>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {user.created_questionnaires ? user.created_questionnaires.length : 0}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Questionários Editados</label>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {user.edited_questionnaires ? user.edited_questionnaires.length : 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}