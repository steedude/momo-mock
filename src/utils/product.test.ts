import { describe, expect, it } from 'vitest'
import { parseProduct } from './product'

const valid = { name: '無線耳機', imageUrl: 'https://example.com/a.jpg', price: 999, promotion: '優惠' }

describe('商品資料驗證', () => {
  it.each([null, undefined, [], {}, { ...valid, name: '' }, { ...valid, name: '  ' }, { ...valid, price: -1 }, { ...valid, price: Number.NaN }, { ...valid, price: Infinity }, { ...valid, price: '' }, { ...valid, price: '999' }, { ...valid, imageUrl: '' }, { ...valid, imageUrl: 'plain text' }, { ...valid, imageUrl: 'javascript:alert(1)' }, { ...valid, imageUrl: 'ftp://example.com/a' }, { ...valid, promotion: null }])('拒絕缺欄位或違反商品格式的輸入 %#', (input) => {
    const result = parseProduct(input)
    expect(result.ok).toBe(false)
  })
  it.each([valid, { ...valid, price: 0, promotion: '' }])('接受合法商品，零售價與空標籤也有效', (input) => {
    const result = parseProduct(input)
    expect(result).toEqual({ ok: true, value: input })
  })
})
