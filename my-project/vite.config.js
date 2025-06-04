import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic', // ✅ enable new JSX transform
  })],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
