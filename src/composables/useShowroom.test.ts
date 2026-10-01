import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../configs/product'
import { createProductStorage } from '../utils/storage'
import { useShowroom } from './useShowroom'

const product = { name: '耳機', imageUrl: 'https://example.com/a.jpg', price: 999, promotion: '優惠' }

function memoryStorage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
  }
}

describe('showroom 狀態與儲存流程', () => {
  it('讀取被拒絕時仍可編輯示範草稿，並顯示讀取失敗', () => {
    const source = { ...memoryStorage(), getItem() {
      throw new Error('blocked')
    } }
    const showroom = useShowroom(() => source)
    expect(showroom.loadWarning.value).toBe('readFailed')
    expect(showroom.lastSaved.value).toBeNull()
    showroom.patchDraft({ price: '0' })
    expect(showroom.preview.value.price).toBe(0)
  })
  it('不同 Showroom 實例的草稿彼此獨立', () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const first = useShowroom(() => source)
    const second = useShowroom(() => source)
    first.patchDraft({ price: '799' })
    expect(second.draft.value.price).toBe('999')
  })
  it.each([
    [null, null],
    ['{bad', 'invalidJson'],
    ['{}', 'invalidData'],
    [JSON.stringify({ version: 1, product: { ...product, price: -1 } }), 'invalidData'],
    [JSON.stringify({ version: 99, product }), 'unsupportedVersion'],
  ])('初次載入或損壞存檔使用示範草稿，保留原資料並回報原因 %#', (raw, warning) => {
    const source = memoryStorage()
    if (raw !== null)
      source.setItem(STORAGE_KEY, raw)
    const showroom = useShowroom(() => source)
    expect(showroom.loadWarning.value).toBe(warning)
    expect(showroom.lastSaved.value).toBeNull()
    expect(showroom.draft.value.name).toContain('示範商品')
    expect(showroom.dirty.value).toBe(false)
    showroom.patchDraft({ price: '123' })
    expect(showroom.preview.value.price).toBe(123)
    expect(source.getItem(STORAGE_KEY)).toBe(raw)
    expect(showroom.save()).toBe(true)
    expect(showroom.loadWarning.value).toBeNull()
  })
  it('寫入失敗保留 799 草稿與 999 快照，解除限制後可重試', () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    let blocked = true
    const browserStorage = {
      getItem: source.getItem,
      setItem(key: string, value: string) {
        if (blocked)
          throw new Error('quota exceeded')
        source.setItem(key, value)
      },
    }
    const showroom = useShowroom(() => browserStorage)
    showroom.patchDraft({ price: '799' })
    expect(showroom.save()).toBe(false)
    expect(showroom.status.value).toBe('failed')
    expect(showroom.draft.value.price).toBe('799')
    expect(showroom.lastSaved.value?.price).toBe(999)
    expect(showroom.dirty.value).toBe(true)
    expect(useShowroom(() => source).preview.value.price).toBe(999)
    blocked = false
    expect(showroom.save()).toBe(true)
    expect(showroom.status.value).toBe('saved')
    expect(showroom.dirty.value).toBe(false)
    expect(useShowroom(() => source).preview.value.price).toBe(799)
  })
  it.each([{ name: '  ' }, { price: '' }, { imageUrl: 'not-a-url' }])('無效草稿無法儲存，保留原快照並回報欄位錯誤 %#', (patch) => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    showroom.patchDraft(patch)
    expect(showroom.save()).toBe(false)
    expect(showroom.status.value).toBe('invalid')
    expect(Object.keys(showroom.errors.value)).toEqual(Object.keys(patch))
    expect(showroom.dirty.value).toBe(true)
    expect(showroom.lastSaved.value).toEqual(product)
    expect(useShowroom(() => source).preview.value).toEqual(product)
  })
  it('按儲存後更新快照、清除未儲存狀態，重開可還原四欄位', () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    showroom.patchDraft({ name: '新耳機', imageUrl: 'https://example.com/new.jpg', price: '799', promotion: '' })
    expect(showroom.save()).toBe(true)
    expect(showroom.dirty.value).toBe(false)
    expect(showroom.lastSaved.value?.price).toBe(799)
    expect(useShowroom(() => source).preview.value).toEqual({ name: '新耳機', imageUrl: 'https://example.com/new.jpg', price: 799, promotion: '' })
  })
  it('修改立即反映預覽，未按儲存重開仍是舊資料', () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    expect(showroom.dirty.value).toBe(false)
    showroom.patchDraft({ name: '新耳機', price: '799', imageUrl: 'https://example.com/new.jpg', promotion: '' })
    expect(showroom.preview.value).toEqual({ name: '新耳機', price: 799, imageUrl: 'https://example.com/new.jpg', promotion: '' })
    expect(showroom.dirty.value).toBe(true)
    expect(showroom.lastSaved.value).toEqual(product)
    expect(useShowroom(() => source).preview.value).toEqual(product)
  })
})
