import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function UsersIndex({ auth, users, roles = [], teams = [], filters = {} }) {
    const { t } = useTranslation();

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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Usuarios</h2>}
        >
            <Head title="Gestión de Usuarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            {/* Header con botón crear */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Lista de Usuarios</h3>
                                <Link
                                    href={route('admin.users.create')}
                                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    Crear Usuario
                                </Link>
                            </div>

                            {/* Tabla de usuarios */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Usuario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Roles
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Equipos
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.data && users.data.length > 0 ? (
                                            users.data.map((user) => (
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
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.teams && user.teams.map((team) => (
                                                                <span
                                                                    key={team.id}
                                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                                                                >
                                                                    {team.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                                            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                                            }`}>
                                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.users.show', user.id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                            >
                                                                Ver
                                                            </Link>
                                                            <Link
                                                                href={route('admin.users.edit', user.id)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => toggleUserStatus(user)}
                                                                className={`${user.is_active
                                                                    ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                                                                    : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                                                                    }`}
                                                            >
                                                                {user.is_active ? 'Desactivar' : 'Activar'}
                                                            </button>
                                                            <button
                                                                onClick={() => deleteUser(user)}
                                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No hay usuarios registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Información de paginación simple */}
                            {users.total && (
                                <div className="mt-6 text-sm text-gray-700 dark:text-gray-300">
                                    Total de usuarios: {users.total}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}