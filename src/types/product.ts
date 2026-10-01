export interface Product {
  name: string
  imageUrl: string
  price: number
  promotion: string
}

export interface ProductPreview extends Omit<Product, 'price'> {
  price: number | null
}

export enum ValidationCode {
  NameRequired = 'nameRequired',
  ImageInvalid = 'imageInvalid',
  PriceInvalid = 'priceInvalid',
  PromotionInvalid = 'promotionInvalid',
}

export type ValidationErrors = Partial<Record<keyof Product, ValidationCode>>
export type ProductResult = { ok: true, value: Product } | { ok: false, errors: ValidationErrors }
