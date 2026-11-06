import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Initialize theme before React renders
if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
}

createInertiaApp({
    title: (title) => title,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: false,
});

// Overlay de carregamento global — cobre navegação entre páginas e envios de
// formulário (ambos passam pelo router do Inertia), sem precisar de mudanças
// em cada página individual.
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'app-loading-overlay';
loadingOverlay.setAttribute('aria-hidden', 'true');
loadingOverlay.className =
    'fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200';
loadingOverlay.innerHTML = `
    <div class="relative w-16 h-16" role="status" aria-label="Carregando">
        <svg class="absolute inset-0 w-16 h-16 animate-spin text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
            <path class="opacity-90" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <svg class="absolute inset-0 m-auto w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    </div>
`;
document.body.appendChild(loadingOverlay);

// Contador de visitas Inertia en vuelo (en vez de un único timeout
// compartido): con dos navegações/submits superpostos, a segunda "start"
// pisava o id do primeiro setTimeout e esse timer órfão nunca era
// cancelado — disparava sozinho depois, tirando "pointer-events-none" do
// overlay para sempre (nenhum "finish" futuro voltava a escondê-lo). Isso
// deixava um <div> invisível fixed inset-0 z-[9999] bloqueando todo clique
// na página sem nenhum aviso visual.
let activeVisits = 0;
let loadingShowTimeout = null;

function showLoadingOverlay() {
    activeVisits += 1;
    if (loadingShowTimeout !== null) return;
    loadingShowTimeout = window.setTimeout(() => {
        loadingShowTimeout = null;
        if (activeVisits > 0) {
            loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
        }
    }, 150);
}

function hideLoadingOverlay() {
    activeVisits = Math.max(0, activeVisits - 1);
    if (activeVisits > 0) return;

    if (loadingShowTimeout !== null) {
        window.clearTimeout(loadingShowTimeout);
        loadingShowTimeout = null;
    }
    loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
}

router.on('start', showLoadingOverlay);
router.on('finish', hideLoadingOverlay);
router.on('cancel', hideLoadingOverlay);
router.on('error', hideLoadingOverlay);

// Nota: antes había un "fade" que ponía body.opacity=0 y lo subía a 1 en 0.3s
// en CADA 'finish'. Eso agregaba ~300ms de retraso percibido a toda navegación
// (y a cada submit), haciendo sentir lenta la app aunque los datos ya estuvieran
// listos. El overlay de carga de arriba ya da feedback suficiente, así que se
// eliminó el fade.
