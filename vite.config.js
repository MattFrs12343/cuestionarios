import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    esbuild: {
        // Remove console/debugger apenas no build de produção — mantém DX normal em dev.
        drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
}));
