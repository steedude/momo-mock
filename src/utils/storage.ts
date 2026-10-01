import type { LoadResult, Product, SaveResult } from '../types/product'
import { STORAGE_KEY, STORAGE_VERSION } from '../configs/product'
import { StorageIssue } from '../types/product'
import { parseProduct } from './product'

export function createProductStorage(source: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.localStorage) {
  return {
    load(): LoadResult {
      // 讀取失敗只回報原因，保留原存檔供使用者決定是否取代。
      let raw: string | null
      try {
        raw = source().getItem(STORAGE_KEY)
      }
      catch {
        return { ok: false, reason: StorageIssue.ReadFailed }
      }
      if (raw === null)
        return { ok: true, value: null }
      let envelope: unknown
      try {
        envelope = JSON.parse(raw)
      }
      catch {
        return { ok: false, reason: StorageIssue.InvalidJson }
      }
      if (!envelope || typeof envelope !== 'object' || !('version' in envelope) || !('product' in envelope))
        return { ok: false, reason: StorageIssue.InvalidData }
      if (envelope.version !== STORAGE_VERSION)
        return { ok: false, reason: StorageIssue.UnsupportedVersion }
      const parsed = parseProduct(envelope.product)
      return parsed.ok ? parsed : { ok: false, reason: StorageIssue.InvalidData }
    },
    save(product: Product): SaveResult {
      try {
        source().setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, product }))
        return { ok: true }
      }
      catch {
        return { ok: false, reason: StorageIssue.WriteFailed }
      }
    },
  }
}
