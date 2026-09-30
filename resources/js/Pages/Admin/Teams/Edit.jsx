import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import UserSearchSelect from '@/Components/UserSearchSelect';

export default function EditTeam({ auth, team, users, isSuperAdmin, moduleCatalog, teamModules }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name: team.name || '',
        users: team.users ? team.users.map(user => user.id) : []
    });

    const modulesForm = useForm({
        modules: moduleCatalog
            ? Object.keys(moduleCatalog).reduce((acc, moduleName) => {
                acc[moduleName] = teamModules?.[moduleName] ?? false;
                return acc;
            }, {})
            : {}
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.teams.update', team.id));
    };

    const handleModulesSubmit = (e) => {
        e.preventDefault();
        modulesForm.put(route('admin.teams.update-modules', team.id));
    };

    const toggleModule = (moduleName) => {
        modulesForm.setData('modules', {
            ...modulesForm.data.modules,
            [moduleName]: !modulesForm.data.modules[moduleName]
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-zinc-200 leading-tight">{t('admin.teams.edit')}</h2>}
        >
            <Head title={`${t('admin.teams.edit')}: ${team.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-sm dark:shadow-zinc-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{t('admin.teams.edit')}: {team.name}</h3>
                                <Link
                                    href={route('admin.teams.index')}
                                    className="bg-gray-500 dark:bg-zinc-500 hover:bg-gray-700 dark:hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    {t('common.back')}
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nombre del equipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                        Nombre del Equipo *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        placeholder="Ej: Desarrollo, Marketing, Ventas, etc."
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                {/* Miembros del equipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-4">
                                        Miembros del Equipo
                                    </label>

                                    {users && users.length > 0 ? (
                                        <UserSearchSelect
                                            users={users}
                                            selectedIds={data.users}
                                            onChange={(ids) => setData('users', ids)}
                                            renderExtra={(user) => (
                                                <div className="flex gap-1 mt-1">
                                                    {user.roles && user.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-zinc-400 py-4 border border-gray-200 dark:border-zinc-500 rounded-md bg-gray-50 dark:bg-zinc-600/50">
                                            No hay usuarios disponibles
                                        </div>
                                    )}
                                    {errors.users && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.users}</p>}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href={route('admin.teams.index')}
                                        className="bg-gray-500 dark:bg-zinc-500 hover:bg-gray-700 dark:hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
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

                            {isSuperAdmin && moduleCatalog && (
                                <form onSubmit={handleModulesSubmit} className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-600">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                        Módulos habilitados para este equipo
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
                                        Define el "plan" del equipo: solo los módulos habilitados acá pueden asignarse a sus usuarios.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-200 dark:border-zinc-500 rounded-md p-4 bg-gray-50 dark:bg-zinc-600/50">
                                        {Object.entries(moduleCatalog).map(([moduleName, label]) => (
                                            <div key={moduleName} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-zinc-500 rounded transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    id={`module-${moduleName}`}
                                                    checked={!!modulesForm.data.modules[moduleName]}
                                                    onChange={() => toggleModule(moduleName)}
                                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 rounded"
                                                />
                                                <label htmlFor={`module-${moduleName}`} className="ml-3 text-sm text-gray-900 dark:text-zinc-100">
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="submit"
                                            disabled={modulesForm.processing}
                                            className="bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors duration-200"
                                        >
                                            {modulesForm.processing ? 'Salvando...' : 'Salvar módulos'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}