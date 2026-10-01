export const TEXT_LIMITS = {
  name: 20,
  imageUrl: 2048,
  promotion: 10,
  badges: 10,
} as const

const moneyRule = { min: 0, max: 999999 } as const
const countRule = { min: 0, max: 9999999 } as const

export const NUMBER_RULES = {
  price: moneyRule,
  originalPrice: moneyRule,
  reviewCount: countRule,
  salesCount: countRule,
} as const

export const RATING_RULE = { min: 0, max: 5, step: 0.5 } as const
export const RATING_OPTIONS = Array.from(
  { length: (RATING_RULE.max - RATING_RULE.min) / RATING_RULE.step + 1 },
  (_, index) => RATING_RULE.min + index * RATING_RULE.step,
)
