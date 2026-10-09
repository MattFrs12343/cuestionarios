import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Apenas erros: sucesso é exibido pelo SaveConfirmation.
        const errorMessage = flash?.error;

        if (!errorMessage) {
            setMessage(null);
            setVisible(false);
            return;
        }

        setMessage(errorMessage);
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), 5000);

        return () => clearTimeout(timer);
    }, [flash?.error]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in-right">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg dark:shadow-zinc-900/50 p-4 transition-colors duration-200">
                <div className="flex items-start">
                    <div className="flex-shrink-0 text-red-400 dark:text-red-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => setVisible(false)}
                            className="inline-flex text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}