import { useEffect, useRef, useState } from 'react';

const COLOR_MAP = {
    violet: {
        activeBg: 'bg-violet-50 dark:bg-violet-900/20',
        activeText: 'text-violet-700 dark:text-violet-300',
        activeBorder: 'border-violet-300 dark:border-violet-700',
        dot: 'bg-violet-500',
        dotDone: 'bg-emerald-500',
        pillActive: 'bg-violet-600 text-white',
    },
    red: {
        activeBg: 'bg-red-50 dark:bg-red-900/20',
        activeText: 'text-red-700 dark:text-red-300',
        activeBorder: 'border-red-300 dark:border-red-700',
        dot: 'bg-red-500',
        dotDone: 'bg-emerald-500',
        pillActive: 'bg-red-600 text-white',
    },
    pink: {
        activeBg: 'bg-pink-50 dark:bg-pink-900/20',
        activeText: 'text-pink-700 dark:text-pink-300',
        activeBorder: 'border-pink-300 dark:border-pink-700',
        dot: 'bg-pink-500',
        dotDone: 'bg-emerald-500',
        pillActive: 'bg-pink-600 text-white',
    },
    indigo: {
        activeBg: 'bg-indigo-50 dark:bg-indigo-900/20',
        activeText: 'text-indigo-700 dark:text-indigo-300',
        activeBorder: 'border-indigo-300 dark:border-indigo-700',
        dot: 'bg-indigo-500',
        dotDone: 'bg-emerald-500',
        pillActive: 'bg-indigo-600 text-white',
    },
};

/**
 * Menú de navegación por secciones para formularios largos.
 * Barra lateral fija en desktop, tira de píldoras pegajosa en mobile.
 * Resalta la sección visible con IntersectionObserver (scroll-spy).
 */
export default function QuestionnaireSectionNav({ sections, color = 'violet', className = '' }) {
    const palette = COLOR_MAP[color] || COLOR_MAP.violet;
    const [activeId, setActiveId] = useState(sections[0]?.id);
    const observerRef = useRef(null);

    useEffect(() => {
        const elements = sections
            .map((s) => document.getElementById(s.id))
            .filter(Boolean);

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
        );

        elements.forEach((el) => observerRef.current.observe(el));
        return () => observerRef.current && observerRef.current.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* Desktop: barra lateral fija */}
            <nav className={`hidden lg:block lg:w-64 lg:flex-shrink-0 ${className}`} aria-label="Seções do formulário">
                <div className="lg:sticky lg:top-24 space-y-1">
                    <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Seções</p>
                    {sections.map((s) => {
                        const isActive = activeId === s.id;
                        return (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors duration-150 ${
                                    isActive
                                        ? `${palette.activeBg} ${palette.activeText} ${palette.activeBorder}`
                                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? palette.dot : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                                {s.label}
                            </a>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile/tablet: tira de píldoras pegajosa */}
            <nav
                className="lg:hidden sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
                aria-label="Seções do formulário"
            >
                <div className="flex gap-2 w-max">
                    {sections.map((s) => {
                        const isActive = activeId === s.id;
                        return (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                                    isActive
                                        ? palette.pillActive
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {s.label}
                            </a>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
