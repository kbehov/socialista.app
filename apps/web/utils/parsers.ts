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

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && RANGE_VALUES.has(raw as AnalyticsRange)) return raw as AnalyticsRange
  return 'weekly'
}

export function parseAnalyticsProvider(value: string | string[] | undefined): SocialProvider | 'all' {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && PROVIDER_VALUES.has(raw as SocialProvider)) return raw as SocialProvider
  return 'all'
}

export function parseAnalyticsRankBy(
  value: string | string[] | undefined,
): AnalyticsAccountPerformanceRankBy {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && PERFORMANCE_RANK_VALUES.has(raw as AnalyticsAccountPerformanceRankBy)) {
    return raw as AnalyticsAccountPerformanceRankBy
  }
  return 'followerGrowth'
}
