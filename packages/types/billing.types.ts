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
