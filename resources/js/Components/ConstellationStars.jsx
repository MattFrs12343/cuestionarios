// Camada de estrelas e linhas de constelação, sem fundo: reaproveitada no login
// e na visão geral de questionários. O brilho é feito por opacidade em apenas 3
// grupos (GPU, sem reflow) e a deriva por transform em 1 camada, então não há
// blur, gradientes nem repaint pesado por elemento.
import { useId } from 'react';

const CONSTELLATION_LINES = [
    [40, 50, 70, 35], [70, 35, 100, 55], [100, 55, 130, 40], [130, 40, 155, 60],
    [300, 80, 340, 60], [340, 60, 360, 110], [360, 110, 320, 130], [320, 130, 300, 80],
    [60, 220, 90, 200], [90, 200, 120, 230], [120, 230, 100, 260],
];

const CONSTELLATION_STARS = [
    [40, 50, 1.8], [70, 35, 1.6], [100, 55, 2], [130, 40, 1.6], [155, 60, 1.8],
    [300, 80, 1.8], [340, 60, 2], [360, 110, 1.6], [320, 130, 1.6],
    [60, 220, 1.6], [90, 200, 1.8], [120, 230, 1.6], [100, 260, 2],
];

const LOOSE_STARS = [
    [20, 150, 1.2], [180, 20, 1.4], [220, 180, 1.2], [250, 250, 1.6], [370, 200, 1.2],
    [10, 280, 1.4], [200, 100, 1.2], [280, 30, 1.2], [150, 150, 1.4], [350, 270, 1.2],
    [80, 120, 1.2], [240, 60, 1.4], [320, 220, 1.2], [190, 280, 1.2], [50, 180, 1.4],
    [270, 150, 1.2], [140, 270, 1.2], [380, 140, 1.4],
];

const TWINKLE_GROUPS = ['animate-twinkle', 'animate-twinkle-alt', 'animate-twinkle-soft'];

// Calculado uma vez no módulo: as posições são fixas e não dependem de props.
const STARS = (() => {
    const groups = TWINKLE_GROUPS.map(() => []);
    CONSTELLATION_STARS.forEach((star, i) => groups[i % 3].push(star));
    LOOSE_STARS.forEach((star, i) => groups[i % 3].push(star));
    return groups;
})();

export default function ConstellationStars({ className = '' }) {
    // O id precisa ser único: as duas telas podem coexistir no mesmo documento.
    const gradientId = `constellation-sky-${useId().replace(/:/g, '')}`;

    return (
        // A área é maior que a faixa visível para a deriva nunca expor uma borda.
        <div className={`absolute -inset-[6%] animate-drift ${className}`}>
            <svg
                className="w-full h-full"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* As estrelas seguem o degradado do céu: claras sobre o azul-marinho
                    do topo, escuras sobre o branco da base (invertido no modo escuro,
                    onde a base também é escura). */}
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" className="[stop-color:#E0F2FE] dark:[stop-color:#F8FAFC]" />
                        <stop offset="100%" className="[stop-color:#2563EB] dark:[stop-color:#7DD3FC]" />
                    </linearGradient>
                </defs>
                {CONSTELLATION_LINES.map(([x1, y1, x2, y2], i) => (
                    <line
                        key={`l-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={`url(#${gradientId})`}
                        strokeWidth="0.7"
                        opacity="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}

                {TWINKLE_GROUPS.map((animation, groupIndex) => (
                    <g key={animation} className={animation}>
                        {STARS[groupIndex].map(([cx, cy, r], i) => (
                            <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill={`url(#${gradientId})`}
                                opacity="0.9"
                            />
                        ))}
                    </g>
                ))}
            </svg>
        </div>
    );
}
