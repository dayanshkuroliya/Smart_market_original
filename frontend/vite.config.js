import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allows the Docker container to expose the port to your host machine
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Points to the Docker Compose backend service
        changeOrigin: true,
      }
    }
  }
})