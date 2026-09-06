import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tavern — AI Dungeon Master',
        short_name: 'Tavern',
        description: 'An LLM-driven tabletop RPG with a persistent world, data-driven rules, and generated art.',
        theme_color: '#0b0a10',
        background_color: '#0b0a10',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
