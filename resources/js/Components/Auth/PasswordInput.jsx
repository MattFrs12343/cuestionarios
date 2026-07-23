import { forwardRef, useEffect, useRef, useState } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default forwardRef(function PasswordInput(
    { className = '', isFocused = false, hasError = false, ...props },
    ref,
) {
    const input = ref ? ref : useRef();
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, [isFocused]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon
                    className={`h-5 w-5 transition-colors duration-200 ${
                        focused
                            ? 'text-blue-500'
                            : hasError
                              ? 'text-red-500'
                              : 'text-gray-400'
                    }`}
                    aria-hidden="true"
                />
            </div>
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className={
                    'block w-full rounded-lg border pl-10 pr-12 py-3 transition-all duration-200 ' +
                    'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
                    (hasError
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500') +
                    ' ' +
                    className
                }
                ref={input}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? `${props.id}-error` : undefined}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
            >
                {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
            </button>
        </div>
    );
});
