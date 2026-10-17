import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    watch: {
      ignored: ['**/back-end/**'],
    },
    proxy: {
      '/uploads': {target:'http://localhost:3000',changeOrigin:true},
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
