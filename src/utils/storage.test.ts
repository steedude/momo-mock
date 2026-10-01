import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../configs/product'
import { createProductStorage } from './storage'

const product = { name: '耳機', imageUrl: 'https://example.com/a.jpg', price: 999, promotion: '優惠' }

function memoryStorage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
  }
}

describe('商品儲存', () => {
  it('寫入被拒絕時仍可讀回先前成功儲存的內容', () => {
    const source = memoryStorage()
    const storage = createProductStorage(() => source)
    storage.save(product)
    const blocked = { ...source, setItem() {
      throw new Error('quota exceeded')
    } }
    const failed = createProductStorage(() => blocked).save({ ...product, price: 799 })
    expect(failed).toEqual({ ok: false, reason: 'writeFailed' })
    expect(storage.load()).toEqual({ ok: true, value: product })
  })
  it('瀏覽器拒絕讀取時回傳失敗，不丟出例外', () => {
    const source = { ...memoryStorage(), getItem() {
      throw new Error('blocked')
    } }
    expect(createProductStorage(() => source).load()).toEqual({ ok: false, reason: 'readFailed' })
    expect(createProductStorage(() => {
      throw new Error('access denied')
    }).load()).toEqual({ ok: false, reason: 'readFailed' })
  })
  it.each([
    ['{broken', 'invalidJson'],
    ['', 'invalidJson'],
    ['null', 'invalidData'],
    ['{}', 'invalidData'],
    [JSON.stringify({ version: 99, product }), 'unsupportedVersion'],
    [JSON.stringify({ version: 1, product: { name: 'missing' } }), 'invalidData'],
    [JSON.stringify({ version: 1, product: { ...product, price: -1 } }), 'invalidData'],
  ])('辨識損壞資料並保留原始內容：%s', (raw, reason) => {
    const source = memoryStorage()
    source.setItem(STORAGE_KEY, raw)
    const storage = createProductStorage(() => source)
    expect(storage.load()).toEqual({ ok: false, reason })
    expect(source.getItem(STORAGE_KEY)).toBe(raw)
  })
  it('無資料時回報空值，儲存後可由新實例讀回四欄位', () => {
    const source = memoryStorage()
    const storage = createProductStorage(() => source)
    expect(storage.load()).toEqual({ ok: true, value: null })
    expect(storage.save(product)).toEqual({ ok: true })
    expect(createProductStorage(() => source).load()).toEqual({ ok: true, value: product })
  })
})
