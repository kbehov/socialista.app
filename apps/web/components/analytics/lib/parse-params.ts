import type { AnalyticsRange, SocialProvider } from '@socialista/types'

const RANGE_VALUES = new Set<AnalyticsRange>(['daily', 'weekly', 'monthly'])

const PROVIDER_VALUES = new Set<SocialProvider>([
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'threads',
])

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && RANGE_VALUES.has(raw as AnalyticsRange)) return raw as AnalyticsRange
  return 'weekly'
}

export function parseAnalyticsProvider(
  value: string | string[] | undefined,
): SocialProvider | 'all' {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && PROVIDER_VALUES.has(raw as SocialProvider)) return raw as SocialProvider
  return 'all'
}
