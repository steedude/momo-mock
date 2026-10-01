import { readFile } from 'node:fs/promises'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue(), tailwindcss(), {
    name: 'serve-card-sample',
    configureServer(server) {
      // 開發模式也提供範例引用的正式產物，避免 Vite 回傳首頁 HTML。
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/embed/product-card.iife.js' && path !== '/embed/product-card.css') {
          next()
          return
        }
        try {
          const content = await readFile(new URL(`./dist${path}`, import.meta.url))
          res.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'text/javascript')
          res.setHeader('Cache-Control', 'no-store')
          res.end(content)
        }
        catch {
          res.statusCode = 503
          res.end('Run pnpm dev to build the card assets.')
        }
      })
    },
  }],
  test: {
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
