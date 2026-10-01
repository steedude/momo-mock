import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue(), tailwindcss(), {
    name: 'sample-development-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        if (path === '/dist/sample.html' || path === '/dist/') {
          response.writeHead(302, { Location: path === '/dist/' ? '/' : '/sample.html' })
          response.end()
          return
        }
        if (path !== '/embed/product-card.iife.js' && path !== '/embed/product-card.css') {
          next()
          return
        }
        try {
          const file = readFileSync(new URL(`./dist${path}`, import.meta.url))
          response.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'text/javascript')
          response.setHeader('Cache-Control', 'no-store')
          response.end(file)
        }
        catch {
          response.statusCode = 404
          response.end('Run pnpm build to create the product-card assets.')
        }
      })
    },
  }],
  test: {
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
