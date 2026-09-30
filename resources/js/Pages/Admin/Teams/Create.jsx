import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import UserSearchSelect from '@/Components/UserSearchSelect';

export default function CreateTeam({ auth, users, roles }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        users: [],
        members: []
    });

    const addMember = () => {
        setData('members', [
            ...data.members,
            { name: '', email: '', password: '', password_confirmation: '', role: '' }
        ]);
    };

    const removeMember = (index) => {
        setData('members', data.members.filter((_, i) => i !== index));
    };

    const updateMember = (index, field, value) => {
        setData(
            'members',
            data.members.map((member, i) =>
                i === index ? { ...member, [field]: value } : member
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Las filas vacías no deberían contar como miembros. El payload se pasa
        // explícito a post() porque un setData() seguido de post() enviaría
        // todavía el estado anterior.
        post(route('admin.teams.store'), {
            ...data,
            members: data.members.filter(
                (m) => m.name.trim() !== '' || m.email.trim() !== ''
            )
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-zinc-200 leading-tight">{t('admin.teams.create')}</h2>}
        >
            <Head title={t('admin.teams.create')} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 overflow-hidden shadow-sm dark:shadow-zinc-900/50 sm:rounded-lg transition-colors duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{t('admin.teams.create')}</h3>
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
                                        {t('admin.teams.name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                        placeholder="Ex: Desenvolvimento, Marketing, Vendas, etc."
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                {/* Miembros nuevos: se crean junto con el equipo */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                                            Novos membros
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addMember}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:text-blue-300"
                                        >
                                            + Adicionar membro
                                        </button>
                                    </div>

                                    {errors.members && (
                                        <p className="mb-2 text-sm text-red-600 dark:text-red-400">{errors.members}</p>
                                    )}

                                    <div className="space-y-4">
                                        {data.members.map((member, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 dark:border-zinc-500 rounded-md p-4 bg-gray-50 dark:bg-zinc-600/50 space-y-3"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                                        Membro {index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(index)}
                                                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                                            Nome *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                                        />
                                                        {errors[`members.${index}.name`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                                {errors[`members.${index}.name`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                                            E-mail *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={member.email}
                                                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                                        />
                                                        {errors[`members.${index}.email`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                                {errors[`members.${index}.email`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                                            Senha *
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={member.password}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setData(
                                                                    'members',
                                                                    data.members.map((m, i) =>
                                                                        i === index
                                                                            ? { ...m, password: value, password_confirmation: value }
                                                                            : m
                                                                    )
                                                                );
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                                        />
                                                        {errors[`members.${index}.password`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                                {errors[`members.${index}.password`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                                            Função *
                                                        </label>
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => updateMember(index, 'role', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {(roles || []).map((role) => (
                                                                <option key={role.id} value={role.name}>
                                                                    {role.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors[`members.${index}.role`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                                {errors[`members.${index}.role`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Miembros del equipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-4">
                                        {t('admin.teams.members')}
                                    </label>

                                    {users && users.length > 0 ? (
                                        <UserSearchSelect
                                            users={users}
                                            selectedIds={data.users}
                                            onChange={(ids) => setData('users', ids)}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500 dark:text-zinc-400 py-4 border border-gray-200 dark:border-zinc-500 rounded-md bg-gray-50 dark:bg-zinc-600/50">
                                            Não há usuários disponíveis
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