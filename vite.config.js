import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// أثناء التطوير: /api و /hubs بيمرّوا لسيرفر لبيك (بدون مشكلة CORS بالمتصفح)
// LABAIK_API=http://localhost:5000 npm run dev → على سيرفر محلي بدل سيرفر Render الحقيقي
export default defineConfig(({ mode }) => {
  const server = loadEnv(mode, '.', 'LABAIK_').LABAIK_API || 'https://labaik-api.onrender.com'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target: server, changeOrigin: true, secure: true },
      },
    },
  }
})
