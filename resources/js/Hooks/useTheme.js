import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Verificar si hay un tema guardado en localStorage
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Si no hay tema guardado, verificar la preferencia del sistema
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
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
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    };
}
