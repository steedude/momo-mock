// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { JSDOM } from 'jsdom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProductCard from './components/ProductCard.vue'
import { createStandaloneHtml } from './embed'
import { i18n } from './i18n'

const product = {
  name: '輕巧無線耳機',
  imageUrl: 'https://example.com/headphones.jpg',
  price: 999,
  promotion: '限時優惠',
}

const cardScript = readFileSync('dist/embed/product-card.iife.js', 'utf8')
beforeEach(() => vi.stubGlobal('fetch', async () => new Response(cardScript, { headers: { 'Content-Type': 'text/javascript' } })))
afterEach(() => vi.unstubAllGlobals())

describe('共用商品卡', () => {
  it.each([undefined, 999, 500])('不呈現缺少或未高於售價的原價 %s', (originalPrice) => {
    const card = mount(ProductCard, { props: { product: { ...product, originalPrice } }, global: { plugins: [i18n] } })
    expect(card.find('del').exists()).toBe(false)
    expect(card.find('.momo-card__reviews').exists()).toBe(false)
    expect(card.find('.momo-card__badges').exists()).toBe(false)
    expect(card.find('.momo-card__sales').exists()).toBe(false)
    card.unmount()
  })
  it('顯示外部提供的完整名稱、原價、評價、標籤與銷量', () => {
    const card = mount(ProductCard, { props: { product: { ...product, originalPrice: 1299, rating: 4.5, reviewCount: 168, salesCount: 3000, badges: ['速達', '折價券'] } }, global: { plugins: [i18n] } })
    expect(card.get('h2').attributes('title')).toBe('輕巧無線耳機')
    expect(card.get('del').text()).toBe('$1,299')
    expect(card.get('[role="img"]').attributes('aria-label')).toBe('評分 4.5／5')
    expect(card.text()).toContain('(168)')
    expect(card.text()).toContain('總銷量 3,000')
    expect(card.findAll('.momo-card__badge').map(badge => badge.text())).toEqual(['速達', '折價券'])
    card.unmount()
  })
  it('名稱與促銷內容中的 HTML 只顯示純文字', () => {
    const card = mount(ProductCard, { props: { product: { ...product, name: '<b>限時</b>', promotion: '<script>bad()</script>' } }, global: { plugins: [i18n] } })
    expect(card.get('h2').text()).toBe('<b>限時</b>')
    expect(card.find('b, script').exists()).toBe(false)
    card.unmount()
  })
  it('圖片失敗顯示佔位，換新網址後可重新載入', async () => {
    const card = mount(ProductCard, { props: { product }, global: { plugins: [i18n] } })
    await card.get('img').trigger('error')
    expect(card.text()).toContain('暫無商品圖片')
    expect(card.find('img').exists()).toBe(false)
    await card.setProps({ product: { ...product, imageUrl: 'https://example.com/new.jpg' } })
    expect(card.get('img').attributes('src')).toBe('https://example.com/new.jpg')
    card.unmount()
  })
  it('空白促銷文字不留下標籤', () => {
    const card = mount(ProductCard, { props: { product: { ...product, promotion: '  ' } }, global: { plugins: [i18n] } })
    expect(card.find('[data-testid="promotion"]').exists()).toBe(false)
    card.unmount()
  })
  it.each([null, Number.NaN, Number.POSITIVE_INFINITY, -1])('無效售價 %s 顯示佔位文字', (price) => {
    const card = mount(ProductCard, { props: { product: { ...product, price } }, global: { plugins: [i18n] } })
    expect(card.get('[data-testid="price"]').text()).toBe('價格待確認')
    card.unmount()
  })
  it('呈現外部提供的四個欄位', () => {
    const card = mount(ProductCard, { props: { product }, global: { plugins: [i18n] } })
    expect(card.get('h2').text()).toBe('輕巧無線耳機')
    expect(card.get('img').attributes('src')).toBe('https://example.com/headphones.jpg')
    expect(card.get('[data-testid="price"]').text()).toBe('$999')
    expect(card.get('[data-testid="promotion"]').text()).toBe('限時優惠')
    card.unmount()
  })
})

describe('獨立嵌入入口', () => {
  it('web Component 驗證新資料，修正後更新卡片，移除後可重新接回', async () => {
    const html = await createStandaloneHtml(product)
    const page = new JSDOM(html, { runScripts: 'dangerously', url: 'file:///product-card.html' })
    try {
      await new Promise(resolve => page.window.addEventListener('load', resolve, { once: true }))
      const element = page.window.document.querySelector('momo-product-card') as HTMLElement & { product: unknown }
      element.product = { ...product, price: -1 }
      await new Promise(resolve => page.window.setTimeout(resolve, 0))
      expect(element.shadowRoot?.querySelector('article')).toBeNull()
      expect(element.shadowRoot?.textContent).toContain('商品資料不正確')
      element.product = { ...product, name: '更新的耳機', price: 790 }
      await new Promise(resolve => page.window.setTimeout(resolve, 0))
      expect(element.shadowRoot?.querySelector('h2')?.textContent).toBe('更新的耳機')
      element.remove()
      await new Promise(resolve => page.window.setTimeout(resolve, 0))
      page.window.document.body.append(element)
      await new Promise(resolve => page.window.setTimeout(resolve, 0))
      expect(element.shadowRoot?.querySelector('[data-testid="price"]')?.textContent?.trim()).toBe('$790')
    }
    finally {
      page.window.close()
    }
  })
  it('伺服器誤回 HTML 時拒絕產生無法執行的下載檔', async () => {
    vi.stubGlobal('fetch', async () => new Response('<!doctype html><html></html>', { headers: { 'Content-Type': 'text/html' } }))
    await expect(createStandaloneHtml(product)).rejects.toThrow()
  })
  it('下載檔使用已註冊的 Web Component，Shadow DOM 內呈現完整商品與樣式', async () => {
    const html = await createStandaloneHtml({ ...product, rating: 3.5, reviewCount: 8, salesCount: 42, badges: ['免運'] })
    const page = new JSDOM(html, { runScripts: 'dangerously', url: 'file:///product-card.html' })
    try {
      await new Promise(resolve => page.window.addEventListener('load', resolve, { once: true }))
      const exported = page.window.document
      expect(exported.querySelector('script:not([type])')).not.toBeNull()
      expect(exported.querySelector('script[src], link[rel="stylesheet"]')).toBeNull()
      expect(page.window.customElements.get('momo-product-card')).toBeDefined()
      const card = exported.querySelector('momo-product-card')?.shadowRoot
      expect(card?.querySelector('h2')?.textContent).toBe('輕巧無線耳機')
      expect(card?.querySelector('[data-testid="price"]')?.textContent?.trim()).toBe('$999')
      expect(card?.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('評分 3.5／5')
      expect(card?.textContent).toContain('總銷量 42')
      expect(card?.querySelector('img')?.getAttribute('src')).toBe(product.imageUrl)
      expect(Array.from(card?.querySelectorAll('style') ?? []).map(style => style.textContent).join('')).toContain('.momo-card')
    }
    finally {
      page.window.close()
    }
  })
  it('下載原始碼將商品資料分行縮排，與程式及樣式分開', async () => {
    const html = await createStandaloneHtml({ ...product, name: '耳機 <特價>', rating: 3.5 })
    expect(html).toContain('\n        "name":')
    const document = new DOMParser().parseFromString(html, 'text/html')
    expect(JSON.parse(document.getElementById('product-data')!.textContent!)).toMatchObject({ name: '耳機 <特價>', rating: 3.5 })
    expect(document.querySelector('momo-product-card')).not.toBeNull()
  })
  it('下載快照保留圖片網址與內嵌樣式，不含 Base64 或外部程式', async () => {
    const html = await createStandaloneHtml({ ...product, name: '</script><b>耳機</b>' })
    const page = new JSDOM(html, { runScripts: 'dangerously', url: 'file:///product-card.html' })
    try {
      await new Promise(resolve => page.window.addEventListener('load', resolve, { once: true }))
      const exported = page.window.document
      const card = exported.querySelector('momo-product-card')!.shadowRoot!
      expect(card.querySelector('h2')?.textContent).toBe('</script><b>耳機</b>')
      expect(card.querySelector('img')?.getAttribute('src')).toBe(product.imageUrl)
      expect(card.querySelector('style')).not.toBeNull()
      expect(exported.querySelector('script[src], link, b')).toBeNull()
      expect(html).not.toContain('data:image/')
      expect(card.querySelector('b')).toBeNull()
      expect(card.textContent).toContain('$999')
    }
    finally {
      page.window.close()
    }
  })
})
