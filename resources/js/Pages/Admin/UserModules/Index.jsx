import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MagnifyingGlassIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, users, modules, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.user-modules.index'), {
            search,
            role,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRole('');
        router.get(route('admin.user-modules.index'));
    };

    const getRoleBadgeColor = (roleName) => {
        switch (roleName) {
            case 'laudador':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'tecnico':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getModuleBadgeColor = (moduleName) => {
        switch (moduleName) {
            case 'electroencefalograma':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'electroneuromiografia':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Gerenciamento de Módulos de Usuário
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Controle de Acesso aos Módulos
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Gestión de Módulos de Usuarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header interno */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-l-4 border-indigo-500 dark:border-indigo-400 pl-4">
                                    Lista de Usuários
                                </h3>
                            </div>
                            {/* Filtros */}
                            {/* Información importante */}
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Informações importantes
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                            <p>
                                                Somente usuários com funções <strong>LAUDADOR</strong> e <strong>TECNICO</strong> são mostrados.  
                                                Os administradores têm acesso total a todos os módulos automaticamente e não exigem atribuição específica.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                                    <div className="flex-1 min-w-64">
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Pesquisar usuário
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="search"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Nombre o email..."
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="min-w-48">
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Funçao
                                        </label>
                                        <select
                                            id="role"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Todas as funçoes</option>
                                            <option value="laudador">Laudador</option>
                                            <option value="tecnico">Ténico</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-200"
                                        >
                                            Pesquisar
                                        </button>
                                        {(search || role) && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-md transition-colors duration-200"
                                            >
                                                Limpar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Tabla de usuarios */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Funçao
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Módulos Asignados
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Acões
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.data.map((user, index) => (
                                            <tr key={user.id} className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/10 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-850'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                            <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                                                        {user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeColor(role.name)} border shadow-sm`}
                                                            >
                                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.active_modules.length > 0 ? (
                                                            user.active_modules.map((module) => (
                                                                <span
                                                                    key={module.id}
                                                                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getModuleBadgeColor(module.module_name)} border shadow-sm`}
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                    </svg>
                                                                    {modules[module.module_name]}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                                                Sem módulos asignados
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                                                        user.is_active 
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
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('admin.user-modules.edit', user.id)}
                                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                                    >
                                                        <PencilIcon className="h-4 w-4 mr-1.5" />
                                                        Gerenciar Módulos
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {users.links && users.links.length > 3 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando {users.from} a {users.to} de {users.total} resultados
                                    </div>
                                    <div className="flex space-x-1">
                                        {users.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
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

                            {users.data.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-3 mx-auto">
                                        <UserIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Nenhum usuário encontrado
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Não há usuários com funções de LAUDADOR ou TÉCNICO que correspondam aos filtros.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}