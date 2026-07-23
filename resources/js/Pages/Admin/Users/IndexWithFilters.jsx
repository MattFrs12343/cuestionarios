import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function UsersIndex({ auth, users, roles = [], teams = [], filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedTeam, setSelectedTeam] = useState(filters.team || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status ?? '');

    const handleSearch = () => {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedRole) params.role = selectedRole;
        if (selectedTeam) params.team = selectedTeam;
        if (selectedStatus !== '') params.status = selectedStatus;

        router.get(route('admin.users.index'), params, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedRole('');
        setSelectedTeam('');
        setSelectedStatus('');
        router.get(route('admin.users.index'));
    };

    const toggleUserStatus = (user) => {
        const action = user.is_active ? t('admin.confirm_deactivate_user') : t('admin.confirm_activate_user');
        if (confirm(action)) {
            router.patch(route('admin.users.toggle-status', user.id), {}, {
                preserveScroll: true
            });
        }
    };

    const deleteUser = (user) => {
        if (confirm(t('admin.confirm_delete_user'))) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                {t('admin.users.title')}
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Gerenciamento de Usuários
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('questionnaires.index')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Link>
                </div>
            }
        >
            <Head title="Gestión de Usuarios" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Contenedor Principal */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl transition-colors duration-200">
                        <div className="p-6">
                            {/* Header com botão criar */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                        <span className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></span>
                                        Lista de Usuários
                                    </h3>
                                </div>
                                <Link
                                    href={route('admin.users.create')}
                                    className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    {t('admin.users.create')}
                                </Link>
                            </div>

                            {/* Filtros */}
                            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm transition-colors duration-200">
                                <div className="flex items-center mb-4">
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filtros de Busca</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Buscar
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nome ou e-mail..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Função
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        >
                                            <option value="">Todas as funções</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.name}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Equipe
                                        </label>
                                        <select
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        >
                                            <option value="">Todas as equipes</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 md:hidden">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 text-sm transition-colors"
                                        >
                                            <option value="">Todos os status</option>
                                            <option value="1">Ativos</option>
                                            <option value="0">Inativos</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
                                        <button
                                            onClick={handleSearch}
                                            className="flex-1 px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 transition-colors duration-200"
                                        >
                                            {t('common.search')}
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-colors duration-200"
                                        >
                                            {t('common.reset')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de usuarios */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Usuário
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Funções
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Equipes
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.data && users.data.length > 0 ? (
                                            users.data.map((user, index) => (
                                                <tr key={user.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {user.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles && user.roles.map((role) => (
                                                                <span
                                                                    key={role.id}
                                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700 shadow-sm"
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                    {role.name}
                                                                </span>
                                                            ))}
                                                            {(!user.roles || user.roles.length === 0) && (
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">Sem roles</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.teams && user.teams.map((team) => (
                                                                <span
                                                                    key={team.id}
                                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 shadow-sm"
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                    </svg>
                                                                    {team.name}
                                                                </span>
                                                            ))}
                                                            {(!user.teams || user.teams.length === 0) && (
                                                                <span className="text-xs text-gray-400 dark:text-gray-500">Sem equipes</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold shadow-sm ${user.is_active
                                                            ? 'bg-gradient-to-r from-emerald-100 to-green-200 dark:from-emerald-900 dark:to-green-800 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
                                                            : 'bg-gradient-to-r from-red-100 to-rose-200 dark:from-red-900 dark:to-rose-800 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                                                            }`}>
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {user.is_active ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                )}
                                                            </svg>
                                                            {user.is_active ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.users.show', user.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-900/20 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title="Ver"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            <Link
                                                                href={route('admin.users.edit', user.id)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title="Editar"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => toggleUserStatus(user)}
                                                                className={`inline-flex items-center justify-center w-9 h-9 ${user.is_active
                                                                    ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700'
                                                                    : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700'
                                                                    } hover:text-white rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110`}
                                                                title={user.is_active ? 'Desativar' : 'Ativar'}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    {user.is_active ? (
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                    ) : (
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    )}
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteUser(user)}
                                                                className="inline-flex items-center justify-center w-9 h-9 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-110"
                                                                title="Eliminar"
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
                                                <td colSpan="5" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                        Nenhum usuário encontrado
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Não há usuários registrados com os filtros atuais.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {users.links && users.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex space-x-1">
                                        {users.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                    link.active
                                                        ? 'bg-purple-500 text-white'
                                                        : link.url
                                                        ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
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