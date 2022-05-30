import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
const config = {
  base: '/inventory-visualizer/',
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
};

if (process.env.LOCAL === 'true') {
  config.server.proxy = {
    "^/eggincassets/.*": {
      target: "https://eggincassets.tcl.sh",
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/eggincassets/, ""),
    },
  }
}

export default defineConfig(config)
