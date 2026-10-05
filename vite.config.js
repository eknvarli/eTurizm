import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  optimizeDeps: {
    include: ['mapbox-gl', '@mapbox/mapbox-gl-geocoder'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {

        manualChunks(id) {
          if (id.includes('mapbox-gl')) return 'mapbox'
          if (id.includes('@turf')) return 'turf'
          if (id.includes('@supabase')) return 'supabase'
        },
      },
    },
  },
})
