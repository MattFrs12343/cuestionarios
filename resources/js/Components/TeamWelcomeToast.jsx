import { useEffect, useState } from 'react';

/**
 * Aviso breve y auto-descartable que muestra en qué equipo está trabajando
 * el usuario. Se dispara (vía prop `show`, compartida por HandleInertiaRequests)
 * cada vez que el equipo activo cambia, para que alguien con acceso a varios
 * equipos note de inmediato dónde van a quedar los cuestionarios que cree.
 */
export default function TeamWelcomeToast({ show, team }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show && team) {
            setVisible(true);

            const timer = setTimeout(() => setVisible(false), 7000);
            return () => clearTimeout(timer);
        }
    }, [show, team?.id]);

    if (!visible || !team) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pointer-events-none animate-slide-down">
            <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-purple-200/60 bg-white/95 px-6 py-4 shadow-2xl shadow-purple-500/10 backdrop-blur-md dark:border-purple-500/30 dark:bg-zinc-700/95">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-base font-bold text-white shadow-lg">
                    {team.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-base text-gray-700 dark:text-zinc-200">
                    Você está trabalhando na equipe{' '}
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {team.name}
                    </span>
                </p>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="ml-1 shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
