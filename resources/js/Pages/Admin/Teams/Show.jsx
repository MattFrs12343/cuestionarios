import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { formatDateTime } from '@/Utils/dateFormatter';

export default function ShowTeam({ auth, team }) {
    const { t } = useTranslation();
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{t('admin.teams.view')}</h2>}
        >
            <Head title={`${t('admin.teams.view')}: ${team.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Informações da Equipe</h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.teams.edit', team.id)}
                                        className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        {t('common.edit')}
                                    </Link>
                                    <Link
                                        href={route('admin.teams.index')}
                                        className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        {t('common.back')}
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información del Equipo */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações Gerais</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Equipe</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{team.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Criação</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {formatDateTime(team.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Atualização</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {formatDateTime(team.updated_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total de Membros</label>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {team.users ? team.users.length : 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Estatísticas</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membros Ativos</label>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {team.users ? team.users.filter(user => user.is_active).length : 0}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membros Inativos</label>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {team.users ? team.users.filter(user => !user.is_active).length : 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Miembros */}
                            <div className="mt-6">
                                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Membros da Equipe</h4>
                                {team.users && team.users.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Usuário
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Funções
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Último Login
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {team.users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {user.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {user.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.roles && user.roles.map((role) => (
                                                                    <span
                                                                        key={role.id}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                                    >
                                                                        {role.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                user.is_active 
                                                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                                                                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                                            }`}>
                                                                {user.is_active ? t('admin.users.active') : t('admin.users.inactive')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {user.last_login_at 
                                                                ? formatDateTime(user.last_login_at)
                                                                : 'Nunca'
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Esta equipe não possui membros atribuídos
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}