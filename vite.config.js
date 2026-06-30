import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🚀 هذا هو السطر اللي كنت ناسيه! يفتح التطبيق على شبكة الواي فاي
  server: {
    host: true, 
  }
})