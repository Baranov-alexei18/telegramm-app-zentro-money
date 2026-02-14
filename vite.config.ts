import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifestPWA: Partial<ManifestOptions | false> = {
  theme_color: '#b07ef7',
  background_color: '#2EC6FE',
  icons: [
    { purpose: 'maskable', sizes: '512x512', src: 'icon512_maskable.png', type: 'image/png' },
    { purpose: 'any', sizes: '512x512', src: 'icon512_rounded.png', type: 'image/png' },
  ],
  orientation: 'any',
  display: 'standalone',
  lang: 'en-RU',
  name: 'Zentro',
  short_name: 'Finance personal and sharing app',
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
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,jpg,svg}'],
      },
      manifest: manifestPWA,
    }),
  ],
});
