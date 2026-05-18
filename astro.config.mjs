// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    site: 'https://sura-pedidos-web.vercel.app',
    vite: {
        optimizeDeps: {
            include: ['xlsx', 'jspdf', 'jspdf-autotable'],
        },
        ssr: {
            noExternal: ['xlsx', 'jspdf', 'jspdf-autotable'],
        },
    },
});