import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mission-list/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ui: path.resolve(__dirname, '../../ui'),
      lib: path.resolve(__dirname, '../../lib'),
    },
  },
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
  },
});
