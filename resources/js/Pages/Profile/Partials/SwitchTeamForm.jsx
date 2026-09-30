import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Solo aparece si el usuario pertenece a 2 o más equipos: le permite cambiar
 * el equipo activo sin cerrar sesión (misma acción que el selector de la
 * barra superior y que el TeamSelectionModal, pero accesible desde el perfil).
 */
export default function SwitchTeamForm({ className = '' }) {
    const { currentTeam, switchableTeams = [] } = usePage().props;
    const [switchingTo, setSwitchingTo] = useState(null);

    if (!switchableTeams || switchableTeams.length < 2) {
        return null;
    }

    const switchTeam = (teamId) => {
        if (String(teamId) === String(currentTeam?.id) || switchingTo !== null) {
            return;
        }

        setSwitchingTo(teamId);
        router.post(route('teams.switch', teamId), {}, {
            preserveScroll: true,
            onFinish: () => setSwitchingTo(null),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
                    Cambiar equipo
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                    Perteneces a {switchableTeams.length} equipos. Elige con cuál trabajar sin salir de la aplicación.
                </p>
            </header>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {switchableTeams.map((team) => {
                    const isCurrent = String(team.id) === String(currentTeam?.id);

                    return (
                        <button
                            key={team.id}
                            type="button"
                            disabled={isCurrent || switchingTo !== null}
                            onClick={() => switchTeam(team.id)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 disabled:cursor-default ${
                                isCurrent
                                    ? 'border-purple-300 bg-purple-50 dark:border-purple-500/40 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-zinc-600 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:border-purple-500/40 dark:hover:bg-purple-900/10 disabled:opacity-60'
                            }`}
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${
                                    isCurrent
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                }`}
                            >
                                {team.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                                    {team.name}
                                </div>
                                {isCurrent && (
                                    <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Equipo actual
                                    </div>
                                )}
                            </div>

                            {switchingTo === team.id && (
                                <svg className="h-4 w-4 shrink-0 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
