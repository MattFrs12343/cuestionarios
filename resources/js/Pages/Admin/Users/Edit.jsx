import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function EditUser({ auth, user, roles, teams }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        phone: user.phone || '',
        address: user.address || '',
        is_active: user.is_active ?? true,
        roles: user.roles ? user.roles.map(role => role.id) : [],
        teams: user.teams ? user.teams.map(team => team.id) : []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const handleRoleChange = (roleId) => {
        const updatedRoles = data.roles.includes(roleId)
            ? data.roles.filter(id => id !== roleId)
            : [...data.roles, roleId];
        setData('roles', updatedRoles);
    };

    const handleTeamChange = (teamId) => {
        const updatedTeams = data.teams.includes(teamId)
            ? data.teams.filter(id => id !== teamId)
            : [...data.teams, teamId];
        setData('teams', updatedTeams);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.users.edit')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gerenciamento de Usuários
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`${t('admin.users.edit')}: ${user.name}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl dark:shadow-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {/* Header do Formulário */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{t('admin.users.edit')}</h1>
                                        <p className="text-blue-100 text-sm mt-1">{user.name}</p>
                                    </div>
                                </div>
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

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Información básica */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                            required
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nova Senha (opcional)
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Deixe em branco para manter a senha atual</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirmar Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Estado
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Usuario activo
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Dirección
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>}
                                </div>

                                {/* Roles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Roles
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {roles && roles.map((role) => (
                                            <div key={role.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.id}`}
                                                    checked={data.roles.includes(role.id)}
                                                    onChange={() => handleRoleChange(role.id)}
                                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                                <label htmlFor={`role-${role.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roles}</p>}
                                </div>

                                {/* Equipos */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Equipos
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {teams && teams.map((team) => (
                                            <div key={team.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`team-${team.id}`}
                                                    checked={data.teams.includes(team.id)}
                                                    onChange={() => handleTeamChange(team.id)}
                                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                                <label htmlFor={`team-${team.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                    {team.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.teams && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.teams}</p>}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href={route('admin.users.index')}
                                        className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        {t('common.cancel')}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Atualizando...' : t('common.update')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}