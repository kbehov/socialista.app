import { pickPrimaryPrice } from '@/lib/polar/polar-mappers'
import { getProductCheckoutUrl } from '@/utils/billing-urls'
import type { PolarProduct, PolarProductPrice, PolarRecurringInterval } from '@socialista/types'

export { getProductCheckoutUrl }

export type FormattedProductPrice = {
  amount: string
  intervalLabel: string | null
  billingNote: string | null
  isFree: boolean
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

const getCurrencyFormatter = (currency: string, fractionDigits: number) => {
  const key = `${currency}:${fractionDigits}`
  const cached = currencyFormatterCache.get(key)

  if (cached) return cached

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

  currencyFormatterCache.set(key, formatter)
  return formatter
}

const formatCurrency = (amountCents: number, currency: string) => {
  const normalizedCurrency = currency.toUpperCase()
  const hasFraction = Math.abs(amountCents % 100) > 0
  const formatter = getCurrencyFormatter(normalizedCurrency, hasFraction ? 2 : 0)
  return formatter.format(amountCents / 100)
}

export const getPrimaryProductPrice = (product: PolarProduct): PolarProductPrice | null => pickPrimaryPrice(product)

const formatInterval = (interval: PolarRecurringInterval, count: number | null) => {
  const unit = count && count > 1 ? `${count} ${interval}s` : interval

  switch (interval) {
    case 'day':
      return 'day'
    case 'week':
      return 'week'
    case 'month':
      return 'month'
    case 'year':
      return 'year'
    default:
      return unit
  }
}

export const formatRecurringInterval = (
  interval: PolarRecurringInterval | null,
  count: number | null,
): string | null => {
  if (!interval) return null
  return formatInterval(interval, count)
}

export const formatProductPrice = (product: PolarProduct): FormattedProductPrice => {
  const price = getPrimaryProductPrice(product)
  const interval = formatRecurringInterval(product.recurringInterval, product.recurringIntervalCount)

  if (!price) {
    return {
      amount: 'Custom',
      intervalLabel: interval ? `per ${interval}` : null,
      billingNote: product.isRecurring ? 'Contact us for pricing' : null,
      isFree: false,
    }
  }

  if (price.amountType === 'free' || price.priceAmount === 0) {
    return {
      amount: 'Free',
      intervalLabel: interval ? `per ${interval}` : null,
      billingNote: product.isRecurring ? 'No credit card required' : 'One-time access',
      isFree: true,
    }
  }

  if (price.amountType === 'custom') {
    const preset = price.presetAmount ?? price.minimumAmount

    return {
      amount: preset != null ? `From ${formatCurrency(preset, price.priceCurrency)}` : 'Pay what you want',
      intervalLabel: interval ? `per ${interval}` : null,
      billingNote: product.isRecurring ? 'Flexible billing' : null,
      isFree: false,
    }
  }

  if (price.priceAmount == null) {
    return {
      amount: 'Custom',
      intervalLabel: interval ? `per ${interval}` : null,
      billingNote: null,
      isFree: false,
    }
  }

  return {
    amount: formatCurrency(price.priceAmount, price.priceCurrency),
    intervalLabel: interval ? `per ${interval}` : null,
    billingNote: product.isRecurring ? `Billed every ${interval ?? 'billing period'}` : 'One-time payment',
    isFree: false,
  }
}

export type PlanLimitKey = 'posts' | 'members' | 'accounts'

export type ProductPlanLimit = {
  key: PlanLimitKey
  value: number
  label: string
  shortLabel: string
}

export type ProductBenefitItem = {
  id: string
  type: string
  description: string
}

const PLAN_LIMIT_KEYS: PlanLimitKey[] = ['posts', 'members', 'accounts']

const PLAN_LIMIT_LABELS: Record<PlanLimitKey, { label: string; shortLabel: string }> = {
  posts: { label: 'Scheduled posts', shortLabel: 'Posts' },
  members: { label: 'Team members', shortLabel: 'Members' },
  accounts: { label: 'Social accounts', shortLabel: 'Accounts' },
}

const limitNumberFormatter = new Intl.NumberFormat('en-US')

export const formatPlanLimitValue = (value: number) => limitNumberFormatter.format(value)

export const getProductPlanLimits = (product: PolarProduct): ProductPlanLimit[] =>
  PLAN_LIMIT_KEYS.flatMap(key => {
    const raw = product.metadata[key]
    if (typeof raw !== 'number' || raw <= 0) return []

    return [{ key, value: raw, ...PLAN_LIMIT_LABELS[key] }]
  })

export const getProductBenefitItems = (product: PolarProduct, overrides?: string[]): ProductBenefitItem[] => {
  if (overrides?.length) {
    return overrides.map((description, index) => ({
      id: `override-${index}`,
      type: 'custom',
      description: description.trim(),
    }))
  }

  return product.benefits
    .map(benefit => ({
      id: benefit.id,
      type: benefit.type,
      description: benefit.description.trim(),
    }))
    .filter(benefit => benefit.description.length > 0)
}

export const getProductFeatures = (product: PolarProduct, overrides?: string[]) =>
  getProductBenefitItems(product, overrides).map(benefit => benefit.description)

export const getDefaultCtaLabel = (
  product: PolarProduct,
  options?: { isCurrentPlan?: boolean; isFeatured?: boolean },
) => {
  if (options?.isCurrentPlan) return 'Current plan'

  const pricing = formatProductPrice(product)

  if (pricing.isFree) return 'Get started free'
  if (options?.isFeatured) return `Upgrade to ${product.name}`
  return `Choose ${product.name}`
}

export const getDefaultPricingFootnote = (product: PolarProduct) => {
  if (!product.isRecurring) return null
  return 'Cancel anytime. No long-term contracts.'
}
