import type { PolarProduct, PolarProductBenefit, PolarProductPrice, PolarRecurringInterval } from '@socialista/types'
import type { Benefit } from '@polar-sh/sdk/models/components/benefit.js'
import type { Product } from '@polar-sh/sdk/models/components/product.js'

const RECURRING_INTERVALS = ['day', 'week', 'month', 'year'] as const

export const toMetadata = (metadata: Product['metadata']): PolarProduct['metadata'] => {
  const result: PolarProduct['metadata'] = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value
    }
  }

  return result
}

const serializeBenefit = (benefit: Benefit): PolarProductBenefit => ({
  id: benefit.id,
  type: benefit.type,
  description: benefit.description,
})

const serializePrice = (price: Product['prices'][number]): PolarProductPrice => {
  const base = {
    id: price.id,
    amountType: price.amountType,
    priceCurrency: price.priceCurrency,
    isArchived: price.isArchived,
  }

  if (price.amountType === 'fixed') {
    return {
      ...base,
      priceAmount: price.priceAmount,
    }
  }

  if (price.amountType === 'free') {
    return {
      ...base,
      priceAmount: 0,
    }
  }

  if (price.amountType === 'custom') {
    return {
      ...base,
      priceAmount: price.presetAmount ?? price.minimumAmount ?? null,
      minimumAmount: price.minimumAmount,
      maximumAmount: price.maximumAmount,
      presetAmount: price.presetAmount,
    }
  }

  return {
    ...base,
    priceAmount: null,
  }
}

const toRecurringInterval = (interval: Product['recurringInterval']): PolarRecurringInterval | null => {
  if (!interval) return null
  return RECURRING_INTERVALS.includes(interval as PolarRecurringInterval) ? (interval as PolarRecurringInterval) : null
}

export const serializePolarProduct = (product: Product): PolarProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  isRecurring: product.isRecurring,
  isArchived: product.isArchived,
  recurringInterval: toRecurringInterval(product.recurringInterval),
  recurringIntervalCount: product.recurringIntervalCount,
  prices: product.prices.filter(price => !price.isArchived).map(serializePrice),
  benefits: product.benefits.map(serializeBenefit),
  metadata: toMetadata(product.metadata),
})

export const pickPrimaryPrice = (product: PolarProduct): PolarProductPrice | null => {
  const activePrices = product.prices.filter(price => !price.isArchived)
  if (activePrices.length === 0) return null

  const fixedPrice = activePrices.find(price => price.amountType === 'fixed' && price.priceAmount !== null)
  if (fixedPrice) return fixedPrice

  const freePrice = activePrices.find(price => price.amountType === 'free')
  if (freePrice) return freePrice

  const customPrice = activePrices.find(price => price.amountType === 'custom')
  if (customPrice) return customPrice

  return activePrices[0] ?? null
}

export const getPrimaryPriceAmount = (product: PolarProduct) => {
  const primaryPrice = pickPrimaryPrice(product)
  if (!primaryPrice) return Number.MAX_SAFE_INTEGER
  if (primaryPrice.amountType === 'free') return 0
  return primaryPrice.priceAmount ?? Number.MAX_SAFE_INTEGER
}
