import type { Product } from '../types/product'

export const STORAGE_KEY = 'momo-showroom:product'
export const STORAGE_VERSION = 1

export function defaultProduct(): Product {
  return {
    name: '【示範商品】輕量無線耳罩式耳機',
    imageUrl: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
    price: 999,
    promotion: '限時優惠・好聲音隨行',
    originalPrice: 1299,
    rating: 4.5,
    reviewCount: 168,
    salesCount: 3000,
    badges: ['速達', '折價券', '贈品'],
  }
}
