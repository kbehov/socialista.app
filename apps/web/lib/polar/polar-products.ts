import type { PolarProduct } from '@socialista/types'
import { unstable_cache } from 'next/cache'

import type { Product } from '@polar-sh/sdk/models/components/product.js'
import { polar } from './polar'
import { getPrimaryPriceAmount, serializePolarProduct } from './polar-mappers'

type PolarListOptions = {
  recurringOnly?: boolean
}

export const POLAR_PRODUCTS_CACHE_TAG = 'polar-products'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

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
  console.log('products', products)

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
