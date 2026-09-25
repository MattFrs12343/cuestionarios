export default function QuestionnaireTypeIcon({ type, className = "w-6 h-6" }) {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
    };

    switch (type) {
        case 'electroencefalograma':
            // Lâmpada (atividade cerebral)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        case 'electroneuromiografia':
            // Raio (condução elétrica nervosa)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            );
        case 'potencial':
            // Olho (potencial evocado visual/auditivo)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            );
        case 'eletroneuromiografia_facial':
            // Rosto (avaliação facial)
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h.01M15 10h.01M8 15c1 1.3 2.4 2 4 2s3-.7 4-2" />
                </svg>
            );
        case 'rastreio_cognitivo':
            // Grade de pontos (teste cognitivo)
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" />
                </svg>
            );
        case 'equilibrio':
            // Figura em pé (equilíbrio e marcha)
            return (
                <svg {...common}>
                    <circle cx="12" cy="5" r="2" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v6m0 0l-4 8m4-8l4 8m-4-4l-5-2m5 2l5-2" />
                </svg>
            );
        case 'estesiometria':
            // Ponto de toque (sensibilidade tátil)
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                </svg>
            );
        case 'tdah_infantil':
            // Estrela (energia/atenção infantil)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            );
        case 'tdah_adulto':
            // Cabeça (avaliação cognitiva/atenção adulto)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            );
        case 'dinamometro':
            // Mão fechada (força de preensão)
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5a6 6 0 1112 0V14m-12-2.5V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v1.5m0 0V9a1.5 1.5 0 013 0v3.5M7 14v3a4 4 0 004 4h1a4 4 0 004-4v-3" />
                </svg>
            );
        default:
            // Documento genérico
            return (
                <svg {...common}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
    }
}
