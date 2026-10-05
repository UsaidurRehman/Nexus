import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` controls the public path. Root deploy => '/'. Subfolder (IIS virtual dir)
// => set VITE_PUBLIC_BASE='/nexus/' and the router basename picks it up automatically
// (see ENV.ROUTER_BASENAME in src/config.js).
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_PUBLIC_BASE || '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Allow any host so the app works behind a reverse proxy / cloud preview URL.
    allowedHosts: true,
    // Optional same-origin proxy: if you prefer no CORS, point the frontend at '/api'
    // (VITE_API_BASE_URL=/api) and let Vite forward to the ASP.NET Core API in dev.
    proxy: process.env.VITE_DEV_API_PROXY
      ? {
          '/api': {
            target: process.env.VITE_DEV_API_PROXY,
            changeOrigin: true,
            secure: false,
          },
        }
      : undefined,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 900,
  },
}));
