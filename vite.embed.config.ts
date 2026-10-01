import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), {
    name: 'copy-sample-html',
    closeBundle() {
      copyFileSync(fileURLToPath(new URL('./sample.html', import.meta.url)), fileURLToPath(new URL('./dist/sample.html', import.meta.url)))
    },
  }],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist/embed',
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/embed.ts', import.meta.url)),
      name: 'MomoCard',
      formats: ['iife'],
      fileName: () => 'product-card.iife.js',
      cssFileName: 'product-card',
    },
  },
})
