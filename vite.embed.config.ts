import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist/embed',
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/web-component.ts', import.meta.url)),
      name: 'MomoProductCard',
      formats: ['iife'],
      fileName: () => 'product-card.iife.js',
      cssFileName: 'product-card',
    },
  },
})
