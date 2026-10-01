import type { Product } from '../types/product'

export const STORAGE_KEY = 'momo-showroom:product'
export const STORAGE_VERSION = 1

export function defaultProduct(baseUrl: string): Product {
  return {
    name: '【示範商品】輕量無線耳罩式耳機 藍牙 5.3／40 小時續航／霧灰色',
    imageUrl: new URL('headphones.svg', baseUrl).href,
    price: 999,
    promotion: '限時優惠・好聲音隨行',
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 168,
    salesCount: 3000,
    badges: ['速達', '折價券', '贈品'],
  }
}
