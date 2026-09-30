// Fundo do app: degradado do céu e, opcionalmente, a camada de constelação.
import ConstellationStars from '@/Components/ConstellationStars';

export default function GalaxyBackground({ className = '', constellations = false }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
            {/* Céu base: azul-marinho no topo, desvanecendo para o fundo do próprio tema
                (branco no claro, grafite no escuro) — o topo é igual nos dois modos. */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0B2A5B_0%,#1B4B87_14%,#3E7FC4_30%,#8FBCE8_48%,#D3E4F7_68%,#FFFFFF_100%)] dark:bg-[linear-gradient(to_bottom,#0B2A5B_0%,#12304F_16%,#1D3A5C_34%,#232B36_64%,#262A30_84%,#27272A_100%)]" />

            {/* A constelação fica só na faixa superior, onde o céu é escuro: em páginas
                longas o degradado clareia antes do fim e as estrelas sumiriam de qualquer
                forma. A máscara evita um corte seco onde a faixa termina. */}
            {constellations && (
                <div className="absolute inset-x-0 top-0 h-[70vh] max-h-[560px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_0%,#000_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_40%,transparent_100%)]">
                    <ConstellationStars />
                </div>
            )}
        </div>
    );
}
