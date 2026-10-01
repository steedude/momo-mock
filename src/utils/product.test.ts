import { describe, expect, it } from 'vitest'
import { parseDraft, parseProduct, previewProduct } from './product'

const valid = { name: '無線耳機', imageUrl: 'https://example.com/a.jpg', price: 999, promotion: '優惠' }

describe('商品資料驗證', () => {
  it.each([
    { originalPrice: -1 },
    { originalPrice: Infinity },
    { originalPrice: '1299' },
    { rating: -1 },
    { rating: 5.1 },
    { rating: Number.NaN },
    { reviewCount: 1.5 },
    { reviewCount: -1 },
    { salesCount: '3000' },
    { salesCount: -1 },
    { badges: '速達' },
    { badges: [1] },
    { badges: [' '] },
    { badges: null },
  ])('拒絕無效的選填商品資訊 %#', (details) => {
    expect(parseProduct({ ...valid, ...details }).ok).toBe(false)
  })
  it('保留外部提供的原價、評價、銷量與標籤，標籤不共用輸入陣列', () => {
    const input = { ...valid, originalPrice: 1299, rating: 4.8, reviewCount: 168, salesCount: 3000, badges: ['速達', '折價券'] }
    const result = parseProduct(input)
    expect(result).toEqual({ ok: true, value: input })
    input.badges.push('額外項目')
    if (result.ok)
      expect(result.value.badges).toEqual(['速達', '折價券'])
  })
  it('無效圖片網址不送往圖片元素，其餘草稿仍可預覽', () => {
    const preview = previewProduct({ ...valid, imageUrl: 'javascript:alert(1)', price: '999' })
    expect(preview).toEqual({ ...valid, imageUrl: '', price: 999 })
  })
  it.each(['', '  ', '-1', 'abc', 'Infinity', 'NaN'])('草稿售價 %s 不可儲存且預覽使用佔位', (price) => {
    const draft = { ...valid, price }
    expect(parseDraft(draft).ok).toBe(false)
    expect(previewProduct(draft).price).toBeNull()
  })
  it('將輸入中的數字文字轉為商品售價', () => {
    const draft = { ...valid, price: '799' }
    expect(parseDraft(draft)).toEqual({ ok: true, value: { ...valid, price: 799 } })
    expect(previewProduct(draft)).toEqual({ ...valid, price: 799 })
  })
  it.each([null, undefined, [], {}, { ...valid, name: '' }, { ...valid, name: '  ' }, { ...valid, price: -1 }, { ...valid, price: Number.NaN }, { ...valid, price: Infinity }, { ...valid, price: '' }, { ...valid, price: '999' }, { ...valid, imageUrl: '' }, { ...valid, imageUrl: 'plain text' }, { ...valid, imageUrl: 'javascript:alert(1)' }, { ...valid, imageUrl: 'ftp://example.com/a' }, { ...valid, promotion: null }])('拒絕缺欄位或違反商品格式的輸入 %#', (input) => {
    const result = parseProduct(input)
    expect(result.ok).toBe(false)
  })
  it.each([valid, { ...valid, price: 0, promotion: '' }])('接受合法商品，零售價與空標籤也有效', (input) => {
    const result = parseProduct(input)
    expect(result).toEqual({ ok: true, value: input })
  })
})
