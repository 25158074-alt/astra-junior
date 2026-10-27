import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('node_modules/@dimforge/rapier3d-compat')) return 'vendor-rapier'
          return undefined
        },
      },
    },
  },
})
