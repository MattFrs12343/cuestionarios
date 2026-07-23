import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function CreateRole({ auth, permissions }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.roles.store'));
    };

    const handlePermissionChange = (permissionId) => {
        const updatedPermissions = data.permissions.includes(permissionId)
            ? data.permissions.filter(id => id !== permissionId)
            : [...data.permissions, permissionId];
        setData('permissions', updatedPermissions);
    };

    const selectAllPermissions = () => {
        setData('permissions', permissions.map(p => p.id));
    };

    const clearAllPermissions = () => {
        setData('permissions', []);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {t('admin.roles.create')}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Gerenciamento de Funções
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('admin.roles.create')} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Banner */}
                    <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">Nova Função</h1>
                                        <p className="text-green-100 text-sm">Preencha os dados para criar uma nova função</p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.roles.index')}
                                    className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    {t('common.back')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nombre del rol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('admin.roles.name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        placeholder="Ex: gerente, supervisor, etc."
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                {/* Permisos */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('admin.roles.permissions')}
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={selectAllPermissions}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                {t('common.select_all')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearAllPermissions}
                                                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            >
                                                Limpar seleção
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50">
                                        {permissions && permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    checked={data.permissions.includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)}
                                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                                <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                    {permission.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permissions && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.permissions}</p>}
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href={route('admin.roles.index')}
                                        className="inline-flex items-center px-6 py-3 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {t('common.cancel')}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 text-white font-semibold rounded-lg disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {processing ? 'Criando...' : t('admin.roles.create')}
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