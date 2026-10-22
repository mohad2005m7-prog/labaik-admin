import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// أثناء التطوير: /api و /hubs بيمرّوا لسيرفر لبيك (بدون مشكلة CORS بالمتصفح)
// LABAIK_API=http://localhost:5000 npm run dev → على سيرفر محلي بدل سيرفر Render الحقيقي
const server = process.env.LABAIK_API ?? 'https://labaik-api.onrender.com'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: server, changeOrigin: true, secure: true },
    },
  },
})
