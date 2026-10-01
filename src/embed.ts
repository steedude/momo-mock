import { createApp } from 'vue'
import ProductCard from './components/ProductCard.vue'
import { i18n } from './i18n'
import { parseProduct } from './utils/product'

export function mountProductCard(container: HTMLElement, data: unknown) {
  const result = parseProduct(data)
  if (!result.ok)
    return result
  const app = createApp(ProductCard, { product: result.value })
  app.use(i18n).mount(container)
  return { ok: true as const, unmount: () => app.unmount() }
}
