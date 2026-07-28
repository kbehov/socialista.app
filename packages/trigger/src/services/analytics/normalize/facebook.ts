import type { AnalyticsSnapshotMetrics, EngagementRateBasis } from '@socialista/db'

export type FacebookPagePayload = {
  id?: string
  followers_count?: number
  fan_count?: number
}

export type FacebookInsightValue = {
  name?: string
  period?: string
  title?: string
  description?: string
  values?: Array<{ value?: unknown; end_time?: string }>
}

export type FacebookInsightsPayload = {
  data?: FacebookInsightValue[]
}

export type FacebookAnalyticsRaw = {
  page?: FacebookPagePayload | null
  insights?: FacebookInsightsPayload | null
}

export type NormalizeFacebookResult = {
  metrics: AnalyticsSnapshotMetrics
  missingMetrics: string[]
}

/** Shared snapshot keys we expect when flows were requested. */
const EXPECTED_FLOW_KEYS = [
  'views',
  'reach',
  'likes',
  'comments',
  'shares',
  'saves',
  'engagement',
] as const

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

/** Sum numeric day-period values for a Page Insights metric. */
function insightSum(entry: FacebookInsightValue | undefined): number | undefined {
  if (!entry) return undefined
  const values = entry.values
  if (!Array.isArray(values) || values.length === 0) return undefined
  let sum = 0
  let found = false
  for (const point of values) {
    const n = readNumber(point?.value)
    if (n === undefined) continue
    sum += n
    found = true
  }
  return found ? sum : undefined
}

/**
 * Sum keyed object day-values (e.g. page_positive_feedback_by_type).
 * Keys are matched case-insensitively; first matching alias wins per day.
 */
function insightObjectKeySum(
  entry: FacebookInsightValue | undefined,
  keyAliases: readonly string[],
): number | undefined {
  if (!entry) return undefined
  const values = entry.values
  if (!Array.isArray(values) || values.length === 0) return undefined

  const aliases = new Set(keyAliases.map(k => k.toLowerCase()))
  let sum = 0
  let found = false

  for (const point of values) {
    const raw = point?.value
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const record = raw as Record<string, unknown>
    for (const [key, val] of Object.entries(record)) {
      if (!aliases.has(key.toLowerCase())) continue
      const n = readNumber(val)
      if (n === undefined) continue
      sum += n
      found = true
      break
    }
  }

  return found ? sum : undefined
}

function computeEngagementRate(
  engagement: number | undefined,
  reach: number | undefined,
  followers: number | undefined,
): { engagementRate?: number; engagementRateBasis?: EngagementRateBasis } {
  if (engagement === undefined) return {}
  if (typeof reach === 'number' && reach > 0) {
    return { engagementRate: engagement / reach, engagementRateBasis: 'reach' }
  }
  if (typeof followers === 'number' && followers > 0) {
    return { engagementRate: engagement / followers, engagementRateBasis: 'followers' }
  }
  return {}
}

export type NormalizeFacebookOptions = {
  /** When false, gauges-only run — do not treat absent flows as missing. Default true. */
  expectFlows?: boolean
}

/**
 * Pure mapper: Facebook Page + insights payloads → shared snapshot metrics.
 *
 * Mapping (post–Nov 2025 Page Insights):
 * - views ← page_media_view
 * - reach ← page_total_media_view_unique
 * - likes ← page_actions_post_reactions_like_total
 * - engagement ← page_post_engagements
 * - comments / shares ← page_positive_feedback_by_type (when present)
 * - saves — not available at Page level
 */
export function normalizeFacebookAnalytics(
  raw: FacebookAnalyticsRaw,
  options?: NormalizeFacebookOptions,
): NormalizeFacebookResult {
  const expectFlows = options?.expectFlows !== false
  const missingMetrics: string[] = []
  const metrics: AnalyticsSnapshotMetrics = {}

  const page = raw.page
  if (page && typeof page === 'object') {
    const followers =
      readNumber(page.followers_count) ?? readNumber(page.fan_count)
    if (followers !== undefined) metrics.followerCount = followers
    else missingMetrics.push('followerCount')
  } else {
    missingMetrics.push('followerCount')
  }

  const insightsList = Array.isArray(raw.insights?.data) ? raw.insights!.data! : null
  if (!insightsList) {
    if (expectFlows) {
      missingMetrics.push(...EXPECTED_FLOW_KEYS)
    }
    return { metrics, missingMetrics }
  }

  const byName = new Map<string, FacebookInsightValue>()
  for (const entry of insightsList) {
    if (entry && typeof entry.name === 'string') {
      byName.set(entry.name, entry)
    }
  }

  const views =
    insightSum(byName.get('page_media_view')) ??
    // Legacy fallbacks if an older Graph version still serves them.
    insightSum(byName.get('page_impressions'))
  const reach =
    insightSum(byName.get('page_total_media_view_unique')) ??
    insightSum(byName.get('page_impressions_unique'))
  const likes = insightSum(byName.get('page_actions_post_reactions_like_total'))
  const engagement = insightSum(byName.get('page_post_engagements'))

  const feedback = byName.get('page_positive_feedback_by_type')
  const comments = insightObjectKeySum(feedback, ['comment', 'comments'])
  const shares = insightObjectKeySum(feedback, ['share', 'shares'])

  if (views !== undefined) metrics.views = views
  else missingMetrics.push('views')
  if (reach !== undefined) metrics.reach = reach
  else missingMetrics.push('reach')
  if (likes !== undefined) metrics.likes = likes
  else missingMetrics.push('likes')
  if (comments !== undefined) metrics.comments = comments
  else missingMetrics.push('comments')
  if (shares !== undefined) metrics.shares = shares
  else missingMetrics.push('shares')
  // Instagram-style saves are not available for Facebook Pages.
  missingMetrics.push('saves')
  if (engagement !== undefined) metrics.engagement = engagement
  else missingMetrics.push('engagement')

  const rate = computeEngagementRate(engagement, reach, metrics.followerCount)
  if (rate.engagementRate !== undefined) {
    metrics.engagementRate = rate.engagementRate
    metrics.engagementRateBasis = rate.engagementRateBasis
  } else if (engagement !== undefined) {
    missingMetrics.push('engagementRate')
  }

  return { metrics, missingMetrics }
}
