import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/eggsaminer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ui: path.resolve(__dirname, '../../ui'),
      'artifact-sandbox': path.resolve(__dirname, '../../wasmegg/artifact-sandbox/src')
    },
  },
  plugins: [vue(), vueJsx()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
  },
});
