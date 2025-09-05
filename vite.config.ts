import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: 'base' MUST match your repo name for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/landing-sanitaria/',
})
