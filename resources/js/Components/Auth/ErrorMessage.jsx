import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export default function ErrorMessage({ message, className = '', type = 'error', ...props }) {
    const [shake, setShake] = useState(false);

    // Trigger shake animation when message appears or changes
    useEffect(() => {
        if (message) {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 400);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!message) return null;

    const styles = {
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: 'text-red-500',
        },
        warning: {
            container: 'bg-amber-50 border-amber-200 text-amber-800',
            icon: 'text-amber-500',
        },
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: 'text-blue-500',
        },
    };

    const currentStyle = styles[type] || styles.error;

    return (
        <div
            {...props}
            className={`flex items-start gap-2 p-3 border rounded-lg ${shake ? 'animate-shake' : ''} ${currentStyle.container} ${className}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <ExclamationCircleIcon 
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${currentStyle.icon}`}
                aria-hidden="true"
            />
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}
