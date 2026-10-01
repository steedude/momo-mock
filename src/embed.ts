import { createApp } from 'vue'
import cardStyles from './card.css?raw'
import ProductCard from './components/ProductCard.vue'
import { i18n } from './i18n'
import { formatCardMarkup } from './utils/formatHtml'
import { parseProduct } from './utils/product'

export async function createStandaloneHtml(data: unknown): Promise<string> {
  const parsed = parseProduct(data)
  if (!parsed.ok)
    throw new Error('Invalid product')
  const container = document.createElement('div')
  // 用同一張商品卡產生靜態 HTML，避免維護另一份下載版模板。
  const app = createApp(ProductCard, { product: parsed.value })
  app.use(i18n).mount(container)
  try {
    return `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商品卡</title>
    <style>
${cardStyles.trim().split('\n').map(line => `      ${line}`).join('\n')}
    </style>
  </head>
  <body>
${formatCardMarkup(container)}
  </body>
</html>`
  }
  finally {
    app.unmount()
  }
}

export function mountProductCard(container: HTMLElement, data: unknown) {
  const result = parseProduct(data)
  if (!result.ok)
    return result
  const app = createApp(ProductCard, { product: result.value })
  app.use(i18n).mount(container)
  return { ok: true as const, unmount: () => app.unmount() }
}
