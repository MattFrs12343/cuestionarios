// Fundo de constelações dinâmicas (uso exclusivo da tela de login).
import ConstellationStars from '@/Components/ConstellationStars';

export default function ConstellationBackground({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
            {/* Céu base: azul-marinho no topo, desvanecendo para o fundo do próprio tema
                (branco no claro, grafite no escuro) — o topo é igual nos dois modos. */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0B2A5B_0%,#1B4B87_14%,#3E7FC4_30%,#8FBCE8_48%,#D3E4F7_68%,#FFFFFF_100%)] dark:bg-[linear-gradient(to_bottom,#0B2A5B_0%,#12304F_16%,#1D3A5C_34%,#232B36_64%,#262A30_84%,#27272A_100%)]" />

            <ConstellationStars />
        </div>
    );
}
