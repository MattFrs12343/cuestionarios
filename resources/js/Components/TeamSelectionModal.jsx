import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Se muestra una vez por sesión cuando el usuario pertenece a más de un
 * equipo, para que elija explícitamente con cuál va a trabajar en vez de
 * quedar asignado en silencio al primero (closeable=false: hay que elegir
 * un equipo para continuar). El mismo componente se reutiliza para el
 * cambio voluntario desde el menú de usuario, ahí sí cerrable.
 */
export default function TeamSelectionModal({ show, teams, closeable = false, onClose = () => {} }) {
    const [switchingTo, setSwitchingTo] = useState(null);

    const choose = (teamId) => {
        if (switchingTo !== null) {
            return;
        }

        setSwitchingTo(teamId);
        router.post(route('teams.switch', teamId), {}, {
            preserveScroll: true,
            onFinish: () => {
                setSwitchingTo(null);
                onClose();
            },
        });
    };

    return (
        <Modal show={show} closeable={closeable} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-5.87M9 20H4v-2a4 4 0 013-5.87m6-1a4 4 0 10-4-4 4 4 0 004 4zm6 3.13a4 4 0 000-7.75M5 12.13a4 4 0 010-7.75" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                            Escolha a equipe com a qual deseja trabalhar
                        </h2>
                        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                            Você pertence a {teams.length} equipes
                        </p>
                    </div>
                </div>

                <p className="mb-4 text-sm text-gray-500 dark:text-zinc-400">
                    Selecione uma para continuar; você poderá trocá-la depois pelo seu perfil ou pelo menu superior.
                </p>

                <div className="max-h-80 space-y-2 overflow-y-auto">
                    {teams.map((team) => {
                        const isSwitching = switchingTo === team.id;

                        return (
                            <button
                                key={team.id}
                                type="button"
                                disabled={switchingTo !== null}
                                onClick={() => choose(team.id)}
                                className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition-all duration-150 hover:border-purple-300 hover:bg-purple-50/60 hover:shadow-md disabled:cursor-default disabled:opacity-60 dark:border-zinc-500 dark:hover:border-purple-500/40 dark:hover:bg-purple-900/20"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow transition-transform duration-150 group-hover:scale-105">
                                    {team.name.charAt(0).toUpperCase()}
                                </div>

                                <span className="flex-1 font-medium text-gray-900 dark:text-zinc-100">
                                    {team.name}
                                </span>

                                {isSwitching ? (
                                    <svg className="h-4 w-4 shrink-0 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="h-4 w-4 shrink-0 text-gray-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-purple-500 dark:text-zinc-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}
