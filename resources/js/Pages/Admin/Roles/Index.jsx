import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function RolesIndex({ auth, roles }) {
    const { t } = useTranslation();
    
    const deleteRole = (role) => {
        if (confirm(t('admin.roles.confirm_delete'))) {
            router.delete(route('admin.roles.destroy', role.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.roles.title')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gerenciamento de Funções
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('admin.roles.title')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            {/* Header con botón crear */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-l-4 border-orange-500 dark:border-orange-400 pl-4">
                                    {t('admin.roles.list')}
                                </h3>
                                <Link
                                    href={route('admin.roles.create')}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 dark:from-orange-600 dark:to-pink-700 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-700 dark:hover:from-orange-700 dark:hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('admin.roles.create')}
                                </Link>
                            </div>

                            {/* Tabla de roles */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nome da Função
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t('admin.roles.permissions')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Usuários
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roles && roles.length > 0 ? (
                                            roles.map((role, index) => (
                                                <tr key={role.id} className={`hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-900/10 dark:hover:to-pink-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {role.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {role.permissions && role.permissions.length > 0 ? (
                                                                role.permissions.slice(0, 3).map((permission) => (
                                                                    <span
                                                                        key={permission.id}
                                                                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-100 to-cyan-200 dark:from-teal-900 dark:to-cyan-800 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700 shadow-sm"
                                                                    >
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        {permission.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">Sem permissões</span>
                                                            )}
                                                            {role.permissions && role.permissions.length > 3 && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                                                    +{role.permissions.length - 3} mais
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">{role.users_count || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.roles.edit', role.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title={t('common.edit')}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            {role.name !== 'administrador' && (
                                                                <button
                                                                    onClick={() => deleteRole(role)}
                                                                    className="inline-flex items-center justify-center w-9 h-9 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                    title={t('common.delete')}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                        Nenhuma função encontrada
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Não há funções registradas no sistema.
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