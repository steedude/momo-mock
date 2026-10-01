// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ProductCard from './components/ProductCard.vue'
import { mountProductCard } from './embed'
import { i18n } from './i18n'
import { createProductStorage } from './utils/storage'

const product = {
  name: '輕巧無線耳機',
  imageUrl: 'https://example.com/headphones.jpg',
  price: 999,
  promotion: '限時優惠',
}

describe('共用商品卡', () => {
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
  it('使用自己的 599 資料，不讀取 Showroom 已儲存的 799', () => {
    createProductStorage().save({ ...product, price: 799 })
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('embedded card must not access storage')
    })
    const container = document.createElement('div')
    const result = mountProductCard(container, { ...product, price: 599 })
    expect(result.ok).toBe(true)
    expect(container.querySelector('[data-testid="price"]')?.textContent?.trim()).toBe('$599')
    if (result.ok)
      result.unmount()
    getItem.mockRestore()
  })
  it.each([null, {}, { ...product, price: -1 }, { ...product, imageUrl: 'javascript:alert(1)' }])('拒絕無效商品，不改動宿主容器 %#', (input) => {
    const container = document.createElement('div')
    container.textContent = '宿主內容'
    const result = mountProductCard(container, input)
    expect(result.ok).toBe(false)
    expect(container.textContent).toBe('宿主內容')
  })
  it('把外部商品掛載到指定容器，並可移除', () => {
    const container = document.createElement('div')
    const result = mountProductCard(container, product)
    expect(result.ok).toBe(true)
    expect(container.querySelector('h2')?.textContent).toBe('輕巧無線耳機')
    if (result.ok)
      result.unmount()
    expect(container.childElementCount).toBe(0)
  })
})
