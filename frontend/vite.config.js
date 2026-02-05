import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    allowedHosts: ['nono.aretaslab.tech', 'localhost', '127.0.0.1'],
    // Proxy /api al backend
    // En Docker: usa VITE_API_BACKEND_URL (http://backend:3000)
    // En local: usa localhost:3000
    proxy: {
      '/api': {
        target: process.env.VITE_API_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
