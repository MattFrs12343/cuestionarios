// Posições fixas (sem aleatoriedade em runtime) para manter o efeito leve e estável entre renders.
// Modo escuro: estrelas brancas agrupadas em "constelações" (unidas por linhas finas).
const CONSTELLATION_STARS = [
    [40, 50, 1.8], [70, 35, 1.6], [100, 55, 2], [130, 40, 1.6], [155, 60, 1.8],
    [300, 80, 1.8], [340, 60, 2], [360, 110, 1.6], [320, 130, 1.6],
    [60, 220, 1.6], [90, 200, 1.8], [120, 230, 1.6], [100, 260, 2],
];

const CONSTELLATION_LINES = [
    [40, 50, 70, 35], [70, 35, 100, 55], [100, 55, 130, 40], [130, 40, 155, 60],
    [300, 80, 340, 60], [340, 60, 360, 110], [360, 110, 320, 130], [320, 130, 300, 80],
    [60, 220, 90, 200], [90, 200, 120, 230], [120, 230, 100, 260],
];

const LOOSE_STARS = [
    [20, 150, 1.2], [180, 20, 1.4], [220, 180, 1.2], [250, 250, 1.6], [370, 200, 1.2],
    [10, 280, 1.4], [200, 100, 1.2], [280, 30, 1.2], [150, 150, 1.4], [350, 270, 1.2],
    [80, 120, 1.2], [240, 60, 1.4], [320, 220, 1.2], [190, 280, 1.2], [50, 180, 1.4],
    [270, 150, 1.2], [140, 270, 1.2], [380, 140, 1.4],
];

export default function GalaxyBackground({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
            {/* Céu base: azul suave de dia, espaço profundo à noite */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50 to-white dark:from-[#0b0a2a] dark:via-[#170f3d] dark:to-[#05040f]" />

            {/* Nebulosas — tons suaves e esbatidos, misturando-se uns aos outros */}
            <div className="absolute -top-24 -left-24 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl animate-drift bg-blue-200/40 dark:bg-indigo-500/20" />
            <div className="absolute top-1/3 -right-16 w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl animate-drift-reverse bg-indigo-200/40 dark:bg-violet-500/20" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-3xl animate-drift bg-sky-200/30 dark:bg-blue-400/15" />

            {/* Modo claro: constelações em azul (com resplandor), sobre o fundo claro */}
            <svg className="absolute inset-0 w-full h-full dark:hidden animate-twinkle" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id="galaxy-line-glow-light" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.2" />
                    </filter>
                </defs>
                {CONSTELLATION_LINES.map(([x1, y1, x2, y2], i) => (
                    <line key={`glow-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60a5fa" strokeWidth="2" opacity="0.45" filter="url(#galaxy-line-glow-light)" />
                ))}
                {CONSTELLATION_LINES.map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2563eb" strokeWidth="0.7" opacity="0.55" />
                ))}
                {CONSTELLATION_STARS.map(([cx, cy, r], i) => (
                    <circle key={`c-${i}`} cx={cx} cy={cy} r={r} fill="#1d4ed8" opacity="0.7" />
                ))}
                {LOOSE_STARS.map(([cx, cy, r], i) => (
                    <circle key={`l-${i}`} cx={cx} cy={cy} r={r} fill="#2563eb" opacity="0.5" />
                ))}
            </svg>

            {/* Modo escuro: estrelas brancas em constelações + estrelas soltas */}
            <svg className="absolute inset-0 w-full h-full hidden dark:block" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id="galaxy-line-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.2" />
                    </filter>
                </defs>
                {/* Resplandor difuminado por trás das linhas, num tom suave azul-violeta */}
                {CONSTELLATION_LINES.map(([x1, y1, x2, y2], i) => (
                    <line key={`glow-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="2" opacity="0.5" filter="url(#galaxy-line-glow)" />
                ))}
                {CONSTELLATION_LINES.map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e0e7ff" strokeWidth="0.6" opacity="0.6" />
                ))}
                {CONSTELLATION_STARS.map(([cx, cy, r], i) => (
                    <circle key={`c-${i}`} cx={cx} cy={cy} r={r} fill="#ffffff" className={i % 2 === 0 ? 'animate-twinkle' : 'animate-twinkle-slow'} />
                ))}
                {LOOSE_STARS.map(([cx, cy, r], i) => (
                    <circle key={`l-${i}`} cx={cx} cy={cy} r={r} fill="#ffffff" opacity="0.8" className={i % 3 === 0 ? 'animate-twinkle-slow' : ''} />
                ))}
            </svg>
        </div>
    );
}
