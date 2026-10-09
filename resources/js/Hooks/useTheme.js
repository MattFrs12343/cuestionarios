import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Verificar si hay un tema guardado en localStorage
        if (typeof window !== 'undefined') {
            try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    return savedTheme;
                }
            } catch {}

            // Si no hay tema guardado, verificar la preferencia del sistema
            if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remover ambas clases primero
        root.classList.remove('light', 'dark');

        // Agregar la clase del tema actual
        root.classList.add(theme);

        // Guardar en localStorage
        try {
            localStorage.setItem('theme', theme);
        } catch {}
    }, [theme]);

    useEffect(() => {
        const applyExternal = (next) => {
            if (next !== 'light' && next !== 'dark') return;
            setTheme((prev) => (prev === next ? prev : next));
        };
        const handleLocal = (event) => applyExternal(event.detail);
        const handleStorage = (event) => applyExternal(event.newValue);

        window.addEventListener('themechange', handleLocal);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('themechange', handleLocal);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const changeTheme = (next) => {
        setTheme(next);
        try {
            window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
        } catch {}
    };

    const toggleTheme = () => {
        changeTheme(theme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => changeTheme('light');
    const setDarkTheme = () => changeTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    };
}
