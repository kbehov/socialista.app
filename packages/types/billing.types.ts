export type PolarRecurringInterval = 'day' | 'week' | 'month' | 'year'

export type PolarProductPriceType = 'free' | 'fixed' | 'custom' | 'metered_unit' | 'seat_based'

export type PolarProductPrice = {
  id: string
  amountType: PolarProductPriceType
  priceAmount: number | null
  priceCurrency: string
  isArchived: boolean
  minimumAmount?: number | null
  maximumAmount?: number | null
  presetAmount?: number | null
}

export type PolarProductBenefit = {
  id: string
  type: string
  description: string
}

export type PolarProduct = {
  id: string
  name: string
  description: string | null
  isRecurring: boolean
  isArchived: boolean
  recurringInterval: PolarRecurringInterval | null
  recurringIntervalCount: number | null
  prices: PolarProductPrice[]
  benefits: PolarProductBenefit[]
  metadata: Record<string, string | number | boolean>
}

export type PolarProductsResponse = {
  products: PolarProduct[]
}

export type PolarWebhookMetadata = Record<string, string | number | boolean>

export type PolarSubscriptionWebhookData = {
  id: string
  customerId: string
  productId?: string
  status: string
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  metadata?: PolarWebhookMetadata | null
}

export type PolarOrderWebhookData = {
  id: string
  customerId: string
  productId?: string | null
  subscriptionId?: string | null
  status: string
  paid: boolean
  totalAmount: number
  metadata?: PolarWebhookMetadata | null
  subscription?: PolarSubscriptionWebhookData | null
}

export type PolarWebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.active'
  | 'subscription.canceled'
  | 'subscription.revoked'
  | 'subscription.uncanceled'
  | 'order.created'
  | 'order.updated'
  | 'order.paid'

export type PolarWebhookEvent =
  | { type: 'subscription.created'; data: PolarSubscriptionWebhookData }
  | { type: 'subscription.updated'; data: PolarSubscriptionWebhookData }
  | { type: 'subscription.active'; data: PolarSubscriptionWebhookData }
  | { type: 'subscription.canceled'; data: PolarSubscriptionWebhookData }
  | { type: 'subscription.revoked'; data: PolarSubscriptionWebhookData }
  | { type: 'subscription.uncanceled'; data: PolarSubscriptionWebhookData }
  | { type: 'order.created'; data: PolarOrderWebhookData }
  | { type: 'order.updated'; data: PolarOrderWebhookData }
  | { type: 'order.paid'; data: PolarOrderWebhookData }

export type PolarWebhookResponse = {
  received: boolean
  handled: boolean
  event: PolarWebhookEventType
}
