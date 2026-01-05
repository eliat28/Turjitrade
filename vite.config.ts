import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Turjitrade/',
  plugins: [react()],
  resolve: {
    alias: {
      'figma:asset': '/public'
    }
  }
})
