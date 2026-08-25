import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

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

/** UI-facing rank metrics for top movers (maps to API `rankBy`). */
export const PERFORMANCE_METRIC_OPTIONS = [
  { value: 'followerGrowth', label: 'Followers' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'reach', label: 'Reach' },
] as const satisfies ReadonlyArray<{
  value: AnalyticsAccountPerformanceRankBy
  label: string
}>

const PERFORMANCE_RANK_VALUES = new Set<AnalyticsAccountPerformanceRankBy>(
  PERFORMANCE_METRIC_OPTIONS.map(option => option.value),
)

export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const raw = firstSearchParam(value)
  if (raw && RANGE_VALUES.has(raw as AnalyticsRange)) return raw as AnalyticsRange
  return 'daily'
}

export function parseAnalyticsProvider(value: string | string[] | undefined): SocialProvider | 'all' {
  const raw = firstSearchParam(value)
  if (raw && PROVIDER_VALUES.has(raw as SocialProvider)) return raw as SocialProvider
  return 'all'
}

export function parseAnalyticsRankBy(
  value: string | string[] | undefined,
): AnalyticsAccountPerformanceRankBy {
  const raw = firstSearchParam(value)
  if (raw && PERFORMANCE_RANK_VALUES.has(raw as AnalyticsAccountPerformanceRankBy)) {
    return raw as AnalyticsAccountPerformanceRankBy
  }
  return 'followerGrowth'
}

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

/** Optional Mongo account id from `?account=`. Invalid values are ignored. */
export function parseAnalyticsAccountId(value: string | string[] | undefined): string | undefined {
  const raw = firstSearchParam(value)
  if (!raw || !OBJECT_ID_RE.test(raw)) return undefined
  return raw
}
