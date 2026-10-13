import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Yagona dist/index.html: shriftlar, uslublar va skript ichiga joylanadi —
// taqdimot internetsiz, faylni ikki marta bosish bilan ochiladi.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
