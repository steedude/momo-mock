import type { Product, ProductDraft, ProductPreview, ProductResult, ValidationErrors } from '../types/product'
import { NUMBER_RULES, RATING_OPTIONS, TEXT_LIMITS } from '../configs/productRules'
import { ValidationCode } from '../types/product'

export function textLength(value: string): number {
  // 與輸入截字共用字元算法，避免把 emoji 的代理對切成兩半。
  return Array.from(value).length
}

function validNumber(value: unknown, rule: { min: number, max: number }): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
    && value >= rule.min && value <= rule.max
}

function validNumericInput(value: string, field: keyof typeof NUMBER_RULES): boolean {
  const rule = NUMBER_RULES[field]
  // 先檢查原始字串，避免 Number 接受科學記號或十六進位。
  return /^\d+$/.test(value) && validNumber(Number(value), rule)
}

export function normalizeProductInput(field: keyof ProductDraft, value: string, previous: string): string {
  if (field in TEXT_LIMITS)
    return Array.from(value).slice(0, TEXT_LIMITS[field as keyof typeof TEXT_LIMITS]).join('')
  if (!value)
    return ''
  if (field === 'rating')
    return RATING_OPTIONS.some(option => String(option) === value) ? value : previous
  return validNumericInput(value, field as keyof typeof NUMBER_RULES) ? value : previous
}

export function parseProduct(input: unknown): ProductResult {
  const product = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {}
  const errors: ValidationErrors = {}
  const { name, imageUrl, price, promotion } = product
  if (typeof name !== 'string' || !name.trim())
    errors.name = ValidationCode.NameRequired
  if (!validNumber(price, NUMBER_RULES.price))
    errors.price = ValidationCode.PriceInvalid
  if (typeof promotion !== 'string')
    errors.promotion = ValidationCode.PromotionInvalid
  for (const key of ['name', 'imageUrl', 'promotion'] as const) {
    const value = product[key]
    if (typeof value === 'string' && textLength(value) > TEXT_LIMITS[key])
      errors[key] = ValidationCode.TextTooLong
  }
  for (const key of ['originalPrice', 'reviewCount', 'salesCount'] as const) {
    const value = product[key]
    if (value !== undefined && !validNumber(value, NUMBER_RULES[key])) {
      errors[key] = ValidationCode.DetailsInvalid
    }
  }
  if (product.rating !== undefined && (typeof product.rating !== 'number' || !RATING_OPTIONS.includes(product.rating)))
    errors.rating = ValidationCode.DetailsInvalid
  if (product.badges !== undefined && (!Array.isArray(product.badges)
    || !product.badges.every(badge => typeof badge === 'string' && !!badge.trim()))) {
    errors.badges = ValidationCode.DetailsInvalid
  }
  else if (Array.isArray(product.badges) && textLength(product.badges.join(',')) > TEXT_LIMITS.badges) {
    errors.badges = ValidationCode.TextTooLong
  }
  try {
    const url = new URL(typeof imageUrl === 'string' ? imageUrl : '')
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      errors.imageUrl = ValidationCode.ImageInvalid
  }
  catch {
    errors.imageUrl = ValidationCode.ImageInvalid
  }
  if (Object.keys(errors).length)
    return { ok: false, errors }
  return {
    ok: true,
    value: {
      name: name as string,
      imageUrl: imageUrl as string,
      price: price as number,
      promotion: promotion as string,
      ...(product.originalPrice !== undefined && { originalPrice: product.originalPrice as number }),
      ...(product.rating !== undefined && { rating: product.rating as number }),
      ...(product.reviewCount !== undefined && { reviewCount: product.reviewCount as number }),
      ...(product.salesCount !== undefined && { salesCount: product.salesCount as number }),
      ...(product.badges !== undefined && { badges: [...product.badges as string[]] }),
    },
  }
}

export function toProductDraft(product: Product): ProductDraft {
  return {
    ...product,
    price: String(product.price),
    originalPrice: product.originalPrice?.toString() ?? '',
    rating: product.rating?.toString() ?? '',
    reviewCount: product.reviewCount?.toString() ?? '',
    salesCount: product.salesCount?.toString() ?? '',
    badges: product.badges?.join(',') ?? '',
  }
}

function draftValues(draft: ProductDraft) {
  const optionalNumber = (field: keyof typeof NUMBER_RULES, value?: string) => value?.trim()
    ? validNumericInput(value, field) ? Number(value) : Number.NaN
    : undefined
  return {
    ...draft,
    price: validNumericInput(draft.price, 'price') ? Number(draft.price) : Number.NaN,
    originalPrice: optionalNumber('originalPrice', draft.originalPrice),
    rating: draft.rating?.trim() ? RATING_OPTIONS.some(option => String(option) === draft.rating) ? Number(draft.rating) : Number.NaN : undefined,
    reviewCount: optionalNumber('reviewCount', draft.reviewCount),
    salesCount: optionalNumber('salesCount', draft.salesCount),
    badges: draft.badges?.trim() ? draft.badges.split(/[,，\n]/).map(value => value.trim()).filter(Boolean) : undefined,
  }
}

export function parseDraft(draft: ProductDraft): ProductResult {
  const result = parseProduct(draftValues(draft))
  if (draft.badges && textLength(draft.badges) > TEXT_LIMITS.badges)
    return { ok: false, errors: { ...(!result.ok && result.errors), badges: ValidationCode.TextTooLong } }
  return result
}

export function previewProduct(draft: ProductDraft): ProductPreview {
  const result = parseDraft(draft)
  const values = draftValues(draft)
  const errors = result.ok ? {} : result.errors
  return {
    ...values,
    price: errors.price ? null : values.price,
    imageUrl: errors.imageUrl ? '' : values.imageUrl,
    originalPrice: errors.originalPrice ? undefined : values.originalPrice,
    rating: errors.rating ? undefined : values.rating,
    reviewCount: errors.reviewCount ? undefined : values.reviewCount,
    salesCount: errors.salesCount ? undefined : values.salesCount,
  }
}
