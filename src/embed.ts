import { createApp } from 'vue'
import cardStyles from './card.css?inline'
import ProductCard from './components/ProductCard.vue'
import { i18n } from './i18n'
import { parseProduct } from './utils/product'

export async function createStandaloneHtml(data: unknown): Promise<string> {
  const parsed = parseProduct(data)
  if (!parsed.ok)
    throw new Error('Invalid product')
  const response = await fetch(parsed.value.imageUrl, { signal: AbortSignal.timeout(15000) })
  if (!response.ok)
    throw new Error('Image download failed')
  const blob = await response.blob()
  if (!blob.type.startsWith('image/'))
    throw new Error('Invalid image format')
  const imageUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Image read failed'))
    reader.readAsDataURL(blob)
  })
  const container = document.createElement('div')
  const app = createApp(ProductCard, { product: { ...parsed.value, imageUrl } })
  app.use(i18n).mount(container)
  try {
    return `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>商品卡</title>
  <style>${cardStyles}</style>
</head>
<body>${container.innerHTML}</body>
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
