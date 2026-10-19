import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// أثناء التطوير: /api و /hubs بيمرّوا لسيرفر لبيك (بدون مشكلة CORS بالمتصفح)
const server = 'https://labaik-api.onrender.com'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: server, changeOrigin: true, secure: true },
    },
  },
})
