import type { PolarProduct, PolarProductBenefit, PolarProductPrice, PolarRecurringInterval } from '@socialista/types'
import type { Benefit } from '@polar-sh/sdk/models/components/benefit.js'
import type { Product } from '@polar-sh/sdk/models/components/product.js'
import { unstable_cache } from 'next/cache'

import { polar } from './polar'

type PolarListOptions = {
  recurringOnly?: boolean
}

const POLAR_PRODUCTS_CACHE_TAG = 'polar-products'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toMetadata = (metadata: Product['metadata']): PolarProduct['metadata'] => {
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

const RECURRING_INTERVALS = ['day', 'week', 'month', 'year'] as const

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

const getPrimaryPriceAmount = (product: PolarProduct) => {
  const fixedPrice = product.prices.find(price => price.amountType === 'fixed' && price.priceAmount !== null)
  if (fixedPrice?.priceAmount != null) return fixedPrice.priceAmount

  const freePrice = product.prices.find(price => price.amountType === 'free')
  if (freePrice) return 0

  const customPrice = product.prices.find(price => price.amountType === 'custom' && price.priceAmount != null)
  return customPrice?.priceAmount ?? Number.MAX_SAFE_INTEGER
}

const sortProductsForPricing = (products: PolarProduct[]) =>
  products.toSorted((a, b) => {
    const priceDiff = getPrimaryPriceAmount(a) - getPrimaryPriceAmount(b)
    if (priceDiff !== 0) return priceDiff
    return a.name.localeCompare(b.name)
  })

const fetchPolarProductsUncached = async (options: PolarListOptions = {}) => {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured')
  }

  const organizationId = process.env.POLAR_ORGANIZATION_ID
  const iterator = await polar.products.list({
    organizationId: organizationId || undefined,
    isArchived: false,
    isRecurring: options.recurringOnly ?? undefined,
    visibility: ['public'],
    limit: 100,
  })

  const products: Product[] = []

  for await (const page of iterator) {
    if (!isRecord(page) || !isRecord(page.result) || !Array.isArray(page.result.items)) {
      continue
    }

    products.push(...(page.result.items as Product[]))
  }

  return sortProductsForPricing(products.map(serializePolarProduct))
}

export const getPolarProducts = (options: PolarListOptions = {}) =>
  unstable_cache(
    async () => fetchPolarProductsUncached(options),
    ['polar-products', options.recurringOnly ? 'recurring' : 'all'],
    {
      revalidate: 300,
      tags: [POLAR_PRODUCTS_CACHE_TAG],
    },
  )()

export const getPolarProductById = async (productId: string) => {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured')
  }

  const product = await polar.products.get({ id: productId })

  if (product.isArchived || product.visibility !== 'public') {
    return null
  }

  return serializePolarProduct(product)
}
