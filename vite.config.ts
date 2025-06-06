import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
