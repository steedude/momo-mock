import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../configs/product'
import { createProductStorage } from '../utils/storage'
import { useShowroom } from './useShowroom'

const product = { name: '耳機', imageUrl: 'https://example.com/a.jpg', price: 999, promotion: '優惠', originalPrice: 1299, rating: 4.8, reviewCount: 168, salesCount: 3000, badges: ['速達', '折價券', '贈品'] }

function memoryStorage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
  }
}

describe('showroom 狀態與儲存流程', () => {
  it('複製尚未完成時儲存新版本，不會把舊版本的複製結果標成新版本已複製', async () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    let finish!: () => void
    const copying = showroom.copyHtml('https://cards.example.com/', () => new Promise<void>((resolve) => {
      finish = resolve
    }))
    showroom.patchDraft({ price: '799' })
    showroom.save()
    finish()
    await copying
    expect(showroom.copyStatus.value).toBe('idle')
  })
  it('舊四欄位存檔只在草稿補充示範資訊，成功儲存前不改引用快照', () => {
    const legacy = { name: '舊商品', imageUrl: 'https://example.com/old.jpg', price: 999, promotion: '' }
    const source = memoryStorage()
    createProductStorage(() => source).save(legacy)
    const showroom = useShowroom(() => source)
    expect(showroom.preview.value.originalPrice).toBe(1299)
    expect(showroom.dirty.value).toBe(true)
    expect(showroom.lastSaved.value).toEqual(legacy)
    expect(createProductStorage(() => source).load()).toEqual({ ok: true, value: legacy })
    expect(showroom.exportHtml('https://cards.example.com/')).not.toContain('originalPrice')
    showroom.save()
    expect(showroom.exportHtml('https://cards.example.com/')).toContain('"originalPrice": 1299')
    expect(showroom.dirty.value).toBe(false)
  })
  it('成功儲存新版本後清除先前的複製成功提示', async () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    await showroom.copyHtml('https://cards.example.com/', async () => {})
    showroom.patchDraft({ price: '799' })
    showroom.save()
    expect(showroom.copyStatus.value).toBe('idle')
    expect(showroom.exportHtml('https://cards.example.com/')).toContain('"price": 799')
  })
  it('剪貼簿被拒絕時顯示失敗，保留可手動複製的 HTML 並可重試', async () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    const before = showroom.exportHtml('https://cards.example.com/')
    expect(await showroom.copyHtml('https://cards.example.com/', async () => {
      throw new Error('clipboard denied')
    })).toBe(false)
    expect(showroom.copyStatus.value).toBe('failed')
    expect(showroom.exportHtml('https://cards.example.com/')).toBe(before)
    expect(await showroom.copyHtml('https://cards.example.com/', async () => {})).toBe(true)
    expect(showroom.copyStatus.value).toBe('copied')
  })
  it('複製最後成功儲存的內容，未儲存草稿不進入剪貼簿', async () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    showroom.patchDraft({ name: '未儲存內容', price: '799' })
    let copied = ''
    expect(await showroom.copyHtml('https://cards.example.com/', async (text) => {
      copied = text
    })).toBe(true)
    expect(copied).toContain('"price": 999')
    expect(copied).not.toContain('未儲存內容')
    expect(showroom.copyStatus.value).toBe('copied')
  })
  it('尚未成功儲存時沒有可引用的 HTML，儲存後產生完整引用內容', async () => {
    const showroom = useShowroom(() => memoryStorage())
    expect(showroom.exportHtml('https://cards.example.com/demo/')).toBeNull()
    let copied: string | undefined
    expect(await showroom.copyHtml('https://cards.example.com/demo/', async (text) => {
      copied = text
    })).toBe(false)
    expect(copied).toBeUndefined()
    showroom.patchDraft({ name: '已儲存耳機', price: '799' })
    expect(showroom.save()).toBe(true)
    const html = showroom.exportHtml('https://cards.example.com/demo/')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('https://cards.example.com/demo/embed/product-card.iife.js')
    expect(html).toContain('https://cards.example.com/demo/embed/product-card.css')
    expect(html).toContain('"price": 799')
    expect(html).toContain('已儲存耳機')
  })
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
    expect(showroom.exportHtml('https://cards.example.com/')).toContain('"price": 999')
    expect(showroom.draft.value.price).toBe('799')
    expect(showroom.lastSaved.value?.price).toBe(999)
    expect(showroom.dirty.value).toBe(true)
    expect(useShowroom(() => source).preview.value.price).toBe(999)
    blocked = false
    expect(showroom.save()).toBe(true)
    expect(showroom.status.value).toBe('saved')
    expect(showroom.exportHtml('https://cards.example.com/')).toContain('"price": 799')
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
    expect(useShowroom(() => source).preview.value).toEqual({ ...product, name: '新耳機', imageUrl: 'https://example.com/new.jpg', price: 799, promotion: '' })
  })
  it('修改立即反映預覽，未按儲存重開仍是舊資料', () => {
    const source = memoryStorage()
    createProductStorage(() => source).save(product)
    const showroom = useShowroom(() => source)
    expect(showroom.dirty.value).toBe(false)
    showroom.patchDraft({ name: '新耳機', price: '799', imageUrl: 'https://example.com/new.jpg', promotion: '' })
    expect(showroom.preview.value).toEqual({ ...product, name: '新耳機', price: 799, imageUrl: 'https://example.com/new.jpg', promotion: '' })
    expect(showroom.dirty.value).toBe(true)
    expect(showroom.lastSaved.value).toEqual(product)
    expect(useShowroom(() => source).preview.value).toEqual(product)
  })
})
