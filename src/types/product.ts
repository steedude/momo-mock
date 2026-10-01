export interface Product {
  name: string
  imageUrl: string
  price: number
  promotion: string
  originalPrice?: number
  rating?: number
  reviewCount?: number
  salesCount?: number
  badges?: readonly string[]
}

export interface ProductPreview extends Omit<Product, 'price'> {
  price: number | null
}

export interface ProductDraft extends Omit<Product, 'price'> {
  price: string
}

export enum ValidationCode {
  NameRequired = 'nameRequired',
  ImageInvalid = 'imageInvalid',
  PriceInvalid = 'priceInvalid',
  PromotionInvalid = 'promotionInvalid',
  DetailsInvalid = 'detailsInvalid',
}

export type ValidationErrors = Partial<Record<keyof Product, ValidationCode>>
export type ProductResult = { ok: true, value: Product } | { ok: false, errors: ValidationErrors }

export enum StorageIssue {
  InvalidJson = 'invalidJson',
  InvalidData = 'invalidData',
  UnsupportedVersion = 'unsupportedVersion',
  ReadFailed = 'readFailed',
  WriteFailed = 'writeFailed',
}

export type LoadResult = { ok: true, value: Product | null } | { ok: false, reason: StorageIssue }
export type SaveResult = { ok: true } | { ok: false, reason: StorageIssue }

export enum SaveStatus {
  Idle = 'idle',
  Saved = 'saved',
  Invalid = 'invalid',
  Failed = 'failed',
}

export enum CopyStatus {
  Idle = 'idle',
  Copied = 'copied',
  Failed = 'failed',
}
