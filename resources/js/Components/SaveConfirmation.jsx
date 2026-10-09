import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function SaveConfirmation() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const flashMessage = flash?.success;

        if (!flashMessage) {
            setMessage(null);
            setVisible(false);
            return;
        }

        setMessage(flashMessage);
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), 4000);

        return () => clearTimeout(timer);
    }, [flash?.success]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto animate-slide-up max-w-md w-full">
                <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-700 border border-emerald-200 dark:border-emerald-800 shadow-xl dark:shadow-zinc-900/50 p-4 transition-all duration-200">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-zinc-100">Salvo com sucesso!</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{message}</p>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        className="flex-shrink-0 inline-flex text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 focus:outline-none"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}