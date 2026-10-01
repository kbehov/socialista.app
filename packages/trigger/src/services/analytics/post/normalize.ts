import type { PostAnalyticsMetrics } from '@socialista/db'

export type PostInsightValue = {
  name?: string
  period?: string
  title?: string
  description?: string
  total_value?: { value?: unknown }
  values?: Array<{ value?: unknown; end_time?: string }>
}

export type PostInsightsPayload = {
  data?: PostInsightValue[]
}

export type NormalizePostInsightsResult = {
  metrics: PostAnalyticsMetrics
  missingMetrics: string[]
}

const EXPECTED_METRIC_KEYS = [
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

function insightScalar(entry: PostInsightValue | undefined): number | undefined {
  if (!entry) return undefined
  const fromTotal = readNumber(entry.total_value?.value)
  if (fromTotal !== undefined) return fromTotal
  const values = entry.values
  if (!Array.isArray(values) || values.length === 0) return undefined
  for (let i = values.length - 1; i >= 0; i--) {
    const n = readNumber(values[i]?.value)
    if (n !== undefined) return n
  }
  return undefined
}

function insightObjectKey(
  entry: PostInsightValue | undefined,
  keyAliases: readonly string[],
): number | undefined {
  if (!entry) return undefined
  const values = entry.values
  if (!Array.isArray(values) || values.length === 0) return undefined
  const aliases = new Set(keyAliases.map(key => key.toLowerCase()))

  for (let i = values.length - 1; i >= 0; i--) {
    const raw = values[i]?.value
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const record = raw as Record<string, unknown>
    for (const [key, val] of Object.entries(record)) {
      if (!aliases.has(key.toLowerCase())) continue
      const n = readNumber(val)
      if (n !== undefined) return n
    }
  }
  return undefined
}

function byName(data: PostInsightValue[]): Map<string, PostInsightValue> {
  const map = new Map<string, PostInsightValue>()
  for (const entry of data) {
    if (typeof entry.name === 'string' && entry.name && !map.has(entry.name)) {
      map.set(entry.name, entry)
    }
  }
  return map
}

const INSTAGRAM_NAME_MAP: Record<string, keyof PostAnalyticsMetrics> = {
  views: 'views',
  plays: 'views',
  reach: 'reach',
  likes: 'likes',
  comments: 'comments',
  shares: 'shares',
  saved: 'saves',
  total_interactions: 'engagement',
}

const FACEBOOK_NAME_MAP: Record<string, keyof PostAnalyticsMetrics> = {
  post_media_view: 'views',
  post_video_views: 'views',
  post_media_view_unique: 'reach',
  post_reactions_like_total: 'likes',
}

function applyMappedMetrics(
  named: Map<string, PostInsightValue>,
  nameMap: Record<string, keyof PostAnalyticsMetrics>,
): PostAnalyticsMetrics {
  const metrics: PostAnalyticsMetrics = {}
  for (const [rawName, key] of Object.entries(nameMap)) {
    if (metrics[key] !== undefined) continue
    const n = insightScalar(named.get(rawName))
    if (n !== undefined) metrics[key] = n
  }
  return metrics
}

function withEngagementFallback(metrics: PostAnalyticsMetrics): PostAnalyticsMetrics {
  if (metrics.engagement !== undefined) return metrics
  const parts = [metrics.likes, metrics.comments, metrics.shares]
  let total = 0
  let found = false
  for (const part of parts) {
    if (typeof part !== 'number') continue
    total += part
    found = true
  }
  if (!found) return metrics
  return { ...metrics, engagement: total }
}

function missingFrom(metrics: PostAnalyticsMetrics): string[] {
  return EXPECTED_METRIC_KEYS.filter(key => metrics[key] === undefined)
}

export function normalizeInstagramPostInsights(
  payload: PostInsightsPayload | null | undefined,
): NormalizePostInsightsResult {
  const named = byName(payload?.data ?? [])
  const metrics = withEngagementFallback(applyMappedMetrics(named, INSTAGRAM_NAME_MAP))
  return { metrics, missingMetrics: missingFrom(metrics) }
}

export function normalizeFacebookPostInsights(
  payload: PostInsightsPayload | null | undefined,
): NormalizePostInsightsResult {
  const named = byName(payload?.data ?? [])
  const metrics = applyMappedMetrics(named, FACEBOOK_NAME_MAP)

  const activity = named.get('post_activity_by_action_type')
  if (metrics.comments === undefined) {
    const comments = insightObjectKey(activity, ['comment', 'comments'])
    if (comments !== undefined) metrics.comments = comments
  }
  if (metrics.shares === undefined) {
    const shares = insightObjectKey(activity, ['share', 'shares'])
    if (shares !== undefined) metrics.shares = shares
  }

  const withEngagement = withEngagementFallback(metrics)
  return {
    metrics: withEngagement,
    missingMetrics: missingFrom(withEngagement),
  }
}
