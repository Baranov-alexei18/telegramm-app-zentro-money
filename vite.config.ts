import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifestPWA: Partial<ManifestOptions | false> = {
  theme_color: '#b07ef7',
  background_color: '#ece8f7',
  icons: [
    { purpose: 'maskable', sizes: '512x512', src: 'icon512_maskable.png', type: 'image/png' },
    { purpose: 'any', sizes: '512x512', src: 'icon512_rounded.png', type: 'image/png' },
  ],
  orientation: 'any',
  display: 'standalone',
  lang: 'en-RU',
  name: 'Zentro',
  short_name: 'Zentro',
  description: 'Finance personal and sharing app',
};

// https://vite.dev/config/
export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@public': path.resolve(__dirname, './public'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,

        globPatterns: ['**/*.{html,css,js,ico,png,jpg,svg,webp}'],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 20,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: ({ url }) => url.host.includes('zentro-money.firebaseapp.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: manifestPWA,
    }),
  ],
});
