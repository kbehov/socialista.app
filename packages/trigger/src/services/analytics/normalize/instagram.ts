import type { AnalyticsSnapshotMetrics, EngagementRateBasis } from '@socialista/db'

export type InstagramProfilePayload = {
  id?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
}

export type InstagramInsightValue = {
  name?: string
  period?: string
  title?: string
  description?: string
  total_value?: { value?: number }
  values?: Array<{ value?: number; end_time?: string }>
}

export type InstagramInsightsPayload = {
  data?: InstagramInsightValue[]
}

export type InstagramAnalyticsRaw = {
  profile?: InstagramProfilePayload | null
  insights?: InstagramInsightsPayload | null
}

export type NormalizeInstagramResult = {
  metrics: AnalyticsSnapshotMetrics
  missingMetrics: string[]
}

const FLOW_METRIC_NAMES = [
  'views',
  'reach',
  'likes',
  'comments',
  'shares',
  'saves',
  'total_interactions',
] as const

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return undefined
}

function insightTotal(entry: InstagramInsightValue | undefined): number | undefined {
  if (!entry) return undefined
  const fromTotal = readNumber(entry.total_value?.value)
  if (fromTotal !== undefined) return fromTotal
  const values = entry.values
  if (!Array.isArray(values) || values.length === 0) return undefined
  // Prefer the last value in a time series if total_value is absent.
  for (let i = values.length - 1; i >= 0; i--) {
    const n = readNumber(values[i]?.value)
    if (n !== undefined) return n
  }
  return undefined
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

export type NormalizeInstagramOptions = {
  /** When false, gauges-only run — do not treat absent flows as missing. Default true. */
  expectFlows?: boolean
}

/**
 * Pure mapper: Instagram Graph profile + insights payloads → shared snapshot metrics.
 * No I/O, no clock — unit-tested in isolation.
 */
export function normalizeInstagramAnalytics(
  raw: InstagramAnalyticsRaw,
  options?: NormalizeInstagramOptions,
): NormalizeInstagramResult {
  const expectFlows = options?.expectFlows !== false
  const missingMetrics: string[] = []
  const metrics: AnalyticsSnapshotMetrics = {}

  const profile = raw.profile
  if (profile && typeof profile === 'object') {
    const followers = readNumber(profile.followers_count)
    const following = readNumber(profile.follows_count)
    const posts = readNumber(profile.media_count)
    if (followers !== undefined) metrics.followerCount = followers
    else missingMetrics.push('followerCount')
    if (following !== undefined) metrics.followingCount = following
    else missingMetrics.push('followingCount')
    if (posts !== undefined) metrics.postsCount = posts
    else missingMetrics.push('postsCount')
  } else {
    missingMetrics.push('followerCount', 'followingCount', 'postsCount')
  }

  const insightsList = Array.isArray(raw.insights?.data) ? raw.insights!.data! : null
  if (!insightsList) {
    if (expectFlows) {
      for (const name of FLOW_METRIC_NAMES) {
        if (name === 'total_interactions') missingMetrics.push('engagement')
        else missingMetrics.push(name)
      }
    }
    return { metrics, missingMetrics }
  }

  const byName = new Map<string, InstagramInsightValue>()
  for (const entry of insightsList) {
    if (entry && typeof entry.name === 'string') {
      byName.set(entry.name, entry)
    }
  }

  const views = insightTotal(byName.get('views'))
  const reach = insightTotal(byName.get('reach'))
  const likes = insightTotal(byName.get('likes'))
  const comments = insightTotal(byName.get('comments'))
  const shares = insightTotal(byName.get('shares'))
  // Meta uses `saves` on newer APIs; older responses used `saved`.
  const saves = insightTotal(byName.get('saves') ?? byName.get('saved'))
  const engagement = insightTotal(byName.get('total_interactions'))

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
  if (saves !== undefined) metrics.saves = saves
  else missingMetrics.push('saves')
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
