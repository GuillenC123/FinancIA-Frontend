import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.BACKEND_PROXY_URL || 'https://financia-api-vnoe.onrender.com'
  const websocketTarget = new URL(backendTarget)
  websocketTarget.protocol = websocketTarget.protocol === 'https:' ? 'wss:' : 'ws:'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          // La llamada servidor-a-servidor evita depender de CORS para desarrollo local.
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
          },
        },
        '/ws': {
          target: websocketTarget.toString(),
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
