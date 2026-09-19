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

const parseMetadataBoolean = (raw: string | number | boolean | undefined): boolean | null => {
  if (raw === true || raw === 'true') return true
  if (raw === false || raw === 'false') return false
  return null
}

const parsePositiveMetadataNumber = (raw: string | number | boolean | undefined): number | null => {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return null
}

export const getProductCreditsAllowance = (product: PolarProduct): number | null =>
  parsePositiveMetadataNumber(product.metadata.credits)

const formatStorageAllowance = (megabytes: number) => {
  if (megabytes >= 1000) {
    const gigabytes = megabytes / 1000
    const formatted =
      gigabytes % 1 === 0 ? limitNumberFormatter.format(gigabytes) : gigabytes.toFixed(1).replace(/\.0$/, '')
    return `${formatted} GB`
  }

  return `${formatPlanLimitValue(megabytes)} MB`
}

const getProductMetadataBenefits = (product: PolarProduct): ProductBenefitItem[] => {
  const items: ProductBenefitItem[] = []

  const credits = getProductCreditsAllowance(product)
  if (credits) {
    items.push({
      id: 'metadata-credits',
      type: 'meter_credit',
      description: `${formatPlanLimitValue(credits)} AI credits per month`,
    })
  }

  const storage = parsePositiveMetadataNumber(product.metadata.storage)
  if (storage) {
    items.push({
      id: 'metadata-storage',
      type: 'storage',
      description: `${formatStorageAllowance(storage)} media storage`,
    })
  }

  if (parseMetadataBoolean(product.metadata.analytics) === true) {
    items.push({
      id: 'metadata-analytics',
      type: 'analytics',
      description: 'Advanced analytics and insights',
    })
  }

  return items
}

const ANALYTICS_FEATURE_LABEL = 'Advanced analytics and insights'

const getProductMetadataFeatureLines = (product: PolarProduct): ProductFeatureLine[] => {
  const lines: ProductFeatureLine[] = []

  const credits = getProductCreditsAllowance(product)
  if (credits) {
    lines.push({
      id: 'metadata-credits',
      text: `${formatPlanLimitValue(credits)} AI credits per month`,
      included: true,
    })
  }

  const storage = parsePositiveMetadataNumber(product.metadata.storage)
  if (storage) {
    lines.push({
      id: 'metadata-storage',
      text: `${formatStorageAllowance(storage)} media storage`,
      included: true,
    })
  }

  if ('analytics' in product.metadata) {
    lines.push({
      id: 'metadata-analytics',
      text: ANALYTICS_FEATURE_LABEL,
      included: parseMetadataBoolean(product.metadata.analytics) === true,
    })
  }

  return lines
}

export const getProductPlanLimits = (product: PolarProduct): ProductPlanLimit[] =>
  PLAN_LIMIT_KEYS.flatMap(key => {
    const value = parsePositiveMetadataNumber(product.metadata[key])
    if (value == null) return []

    return [{ key, value, ...PLAN_LIMIT_LABELS[key] }]
  })

export const getProductBenefitItems = (product: PolarProduct, overrides?: string[]): ProductBenefitItem[] => {
  if (overrides?.length) {
    return overrides.map((description, index) => ({
      id: `override-${index}`,
      type: 'custom',
      description: description.trim(),
    }))
  }

  const polarBenefits = product.benefits
    .map(benefit => ({
      id: benefit.id,
      type: benefit.type,
      description: benefit.description.trim(),
    }))
    .filter(benefit => benefit.description.length > 0)

  if (polarBenefits.length > 0) return polarBenefits

  return getProductMetadataBenefits(product)
}

export const getProductFeatures = (product: PolarProduct, overrides?: string[]) =>
  getProductBenefitItems(product, overrides).map(benefit => benefit.description)

export type ProductFeatureLine = {
  id: string
  text: string
  included: boolean
}

export const getProductFeatureLines = (product: PolarProduct, overrides?: string[]): ProductFeatureLine[] => {
  if (overrides?.length) {
    return overrides
      .map(description => description.trim())
      .filter(description => description.length > 0)
      .map((text, index) => ({ id: `override-${index}`, text, included: true }))
  }

  const lines: ProductFeatureLine[] = []

  for (const limit of getProductPlanLimits(product)) {
    lines.push({
      id: `limit-${limit.key}`,
      text: `${formatPlanLimitValue(limit.value)} ${limit.label.toLowerCase()}`,
      included: true,
    })
  }

  const polarBenefits = product.benefits
    .map(benefit => ({
      id: benefit.id,
      text: benefit.description.trim(),
      included: true,
    }))
    .filter(benefit => benefit.text.length > 0)

  const tail: ProductFeatureLine[] =
    polarBenefits.length > 0 ? [...polarBenefits] : getProductMetadataFeatureLines(product)

  if ('analytics' in product.metadata) {
    const analyticsIncluded = parseMetadataBoolean(product.metadata.analytics) === true
    const analyticsIndex = tail.findIndex(
      line => line.id === 'metadata-analytics' || line.text.toLowerCase().includes('analytics'),
    )

    if (analyticsIndex >= 0) {
      tail[analyticsIndex] = {
        ...tail[analyticsIndex],
        included: analyticsIncluded,
      }
    } else {
      tail.push({
        id: 'metadata-analytics',
        text: ANALYTICS_FEATURE_LABEL,
        included: analyticsIncluded,
      })
    }
  }

  return [...lines, ...tail]
}

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
