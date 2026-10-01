import type { ProductDraft, ProductPreview, ProductResult, ValidationErrors } from '../types/product'
import { ValidationCode } from '../types/product'

export function parseProduct(input: unknown): ProductResult {
  const product = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {}
  const errors: ValidationErrors = {}
  const { name, imageUrl, price, promotion } = product
  if (typeof name !== 'string' || !name.trim())
    errors.name = ValidationCode.NameRequired
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
    errors.price = ValidationCode.PriceInvalid
  if (typeof promotion !== 'string')
    errors.promotion = ValidationCode.PromotionInvalid
  for (const key of ['originalPrice', 'rating', 'reviewCount', 'salesCount'] as const) {
    const value = product[key]
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value < 0
      || (key === 'rating' && value > 5)
      || ((key === 'reviewCount' || key === 'salesCount') && !Number.isSafeInteger(value)))) {
      errors[key] = ValidationCode.DetailsInvalid
    }
  }
  if (product.badges !== undefined && (!Array.isArray(product.badges)
    || !product.badges.every(badge => typeof badge === 'string' && !!badge.trim()))) {
    errors.badges = ValidationCode.DetailsInvalid
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

export function parseDraft(draft: ProductDraft): ProductResult {
  return parseProduct({ ...draft, price: draft.price.trim() ? Number(draft.price) : Number.NaN })
}

export function previewProduct(draft: ProductDraft): ProductPreview {
  const result = parseDraft(draft)
  return {
    ...draft,
    price: !result.ok && result.errors.price ? null : Number(draft.price),
    imageUrl: !result.ok && result.errors.imageUrl ? '' : draft.imageUrl,
  }
}
