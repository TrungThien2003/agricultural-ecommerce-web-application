import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Khi client gọi /api/provinces/v1/p/ sẽ được chuyển tiếp
      '/api/provinces': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true, // Quan trọng: thay đổi header Host của request thành domain đích
        rewrite: (path) => path.replace(/^\/api\/provinces/, ''), // Nếu muốn loại bỏ /api/provinces
        secure: true, // Vì API đích là HTTPS
      },
    },
  },
})
