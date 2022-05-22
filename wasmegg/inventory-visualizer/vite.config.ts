import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/inventory-visualizer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ui: path.resolve(__dirname, '../../ui'),
    },
  },
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,

    proxy: {
      "^/eggincassets/.*": {
        target: "https://eggincassets.tcl.sh",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/eggincassets/, ""),
      },
    },
  },
});
