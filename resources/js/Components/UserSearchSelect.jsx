import { useMemo, useState } from 'react';

/**
 * Buscador con autocompletado para agregar usuarios a una lista de
 * seleccionados, en vez de renderizar un checkbox por cada usuario existente.
 */
export default function UserSearchSelect({ users, selectedIds, onChange, renderExtra }) {
    const [query, setQuery] = useState('');

    const selectedUsers = useMemo(
        () => selectedIds.map((id) => users.find((u) => u.id === id)).filter(Boolean),
        [selectedIds, users]
    );

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return users
            .filter((u) => !selectedIds.includes(u.id))
            .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
            .slice(0, 8);
    }, [query, users, selectedIds]);

    const addUser = (id) => {
        onChange([...selectedIds, id]);
        setQuery('');
    };

    const removeUser = (id) => {
        onChange(selectedIds.filter((sid) => sid !== id));
    };

    return (
        <div>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre o e-mail..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-600 text-gray-900 dark:text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                />
                {query.trim() !== '' && (
                    <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-zinc-600 border border-gray-200 dark:border-zinc-500 rounded-md shadow-lg">
                        {results.length > 0 ? (
                            results.map((user) => (
                                <button
                                    type="button"
                                    key={user.id}
                                    onClick={() => addUser(user.id)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-500 transition-colors duration-150"
                                >
                                    <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">{user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</div>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">
                                Ningún usuario coincide con la búsqueda
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-2">
                {selectedUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Ningún miembro seleccionado todavía.</p>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                                {selectedUsers.length} seleccionado{selectedUsers.length === 1 ? '' : 's'}
                            </span>
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                                Limpiar selección
                            </button>
                        </div>
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-600/50 border border-gray-200 dark:border-zinc-500 rounded-md"
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">{user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</div>
                                    {renderExtra && renderExtra(user)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeUser(user.id)}
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
