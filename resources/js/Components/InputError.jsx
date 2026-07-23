import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function InputError({ message, className = '', ...props }) {
    const [shake, setShake] = useState(false);

    // Trigger shake animation when message changes
    useEffect(() => {
        if (message) {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 400);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return message ? (
        <div
            {...props}
            className={`flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 ${shake ? 'animate-shake' : ''} ${className}`}
            role="alert"
            aria-live="polite"
        >
            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium">{message}</p>
        </div>
    ) : null;
}
