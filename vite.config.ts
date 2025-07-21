import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Module-planner/', // GitHub Pages base path
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  root: '.',
  publicDir: 'public',
})
