export const PAID_PLANS = {
  basic: {
    priceEnv: 'STRIPE_PRICE_BASIC',
    amount: 359000,
    currency: 'ngn',
    interval: 'month',
    intervalCount: 1,
  },
  pro: {
    priceEnv: 'STRIPE_PRICE_PRO',
    amount: 5000000,
    currency: 'ngn',
    interval: 'month',
    intervalCount: 1,
  },
} as const

export type PaidPlanId = keyof typeof PAID_PLANS
