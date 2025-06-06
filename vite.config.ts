/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
    },
    envDir: path.resolve(__dirname),
    envPrefix: 'VITE_',
    define: {
      'import.meta.env.VITE_TOGGL_TOKEN': JSON.stringify(env.VITE_TOGGL_TOKEN),
      'import.meta.env.VITE_TOGGL_REPORT_ID': JSON.stringify(env.VITE_TOGGL_REPORT_ID),
    },
    server: {
      proxy: {
        '/toggl-api': {
          target: 'https://api.track.toggl.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/toggl-api/, ''),
          secure: true,
        }
      }
    }
  };
}); 