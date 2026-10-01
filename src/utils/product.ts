import type { ProductResult, ValidationErrors } from '../types/product'
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
    value: { name: name as string, imageUrl: imageUrl as string, price: price as number, promotion: promotion as string },
  }
}
