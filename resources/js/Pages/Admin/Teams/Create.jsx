import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function CreateTeam({ auth, users }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        users: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.teams.store'));
    };

    const handleUserChange = (userId) => {
        const updatedUsers = data.users.includes(userId)
            ? data.users.filter(id => id !== userId)
            : [...data.users, userId];
        setData('users', updatedUsers);
    };

    const selectAllUsers = () => {
        setData('users', users.map(u => u.id));
    };

    const clearAllUsers = () => {
        setData('users', []);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{t('admin.teams.create')}</h2>}
        >
            <Head title={t('admin.teams.create')} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('admin.teams.create')}</h3>
                                <Link
                                    href={route('admin.teams.index')}
                                    className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    {t('common.back')}
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nombre del equipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('admin.teams.name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        placeholder="Ex: Desenvolvimento, Marketing, Vendas, etc."
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                {/* Miembros del equipo */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('admin.teams.members')}
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={selectAllUsers}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                {t('common.select_all')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearAllUsers}
                                                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            >
                                                Limpar seleção
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50">
                                        {users && users.length > 0 ? (
                                            users.map((user) => (
                                                <div key={user.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200">
                                                    <input
                                                        type="checkbox"
                                                        id={`user-${user.id}`}
                                                        checked={data.users.includes(user.id)}
                                                        onChange={() => handleUserChange(user.id)}
                                                        className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                    />
                                                    <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm">
                                                        <div className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-4">
                                                Não há usuários disponíveis
                                            </div>
                                        )}
                                    </div>
                                    {errors.users && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.users}</p>}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href={route('admin.teams.index')}
                                        className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        {t('common.cancel')}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {processing ? 'Criando...' : t('admin.teams.create')}
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