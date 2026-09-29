import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // El navegador manda Origin incluso en peticiones al mismo origen, y el backend
        // lo rechaza con 403 porque su configuracion de CORS no llega a aplicarse.
        // Sin esa cabecera la trata como llamada servidor-a-servidor y responde normal.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
