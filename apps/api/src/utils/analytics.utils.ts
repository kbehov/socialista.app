import { HttpError } from '@/utils/http-response.js'
import type {
  AccountAnalyticsSeriesPoint,
  AnalyticsGranularity,
} from '@socialista/db'
import type {
  AnalyticsMetrics,
  AnalyticsRange,
  AnalyticsSeriesPoint,
} from '@socialista/types'

const MS_DAY = 24 * 60 * 60 * 1000

export type AnalyticsPeriodWindow = {
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  seriesStart: Date
  granularity: AnalyticsGranularity
}

export function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  const range = (value ?? 'weekly').toLowerCase()
  if (range === 'daily' || range === 'weekly' || range === 'monthly') {
    return range
  }
  throw new HttpError(400, 'range must be daily, weekly, or monthly')
}

/** Resolve current/previous periods and series lookback for a range. */
export function resolveAnalyticsPeriods(
  range: AnalyticsRange,
  now = new Date(),
): AnalyticsPeriodWindow {
  const currentEnd = now

  if (range === 'daily') {
    const currentStart = new Date(currentEnd.getTime() - MS_DAY)
    const previousEnd = currentStart
    const previousStart = new Date(previousEnd.getTime() - MS_DAY)
    const seriesStart = new Date(currentEnd.getTime() - 14 * MS_DAY)
    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      seriesStart,
      granularity: 'day',
    }
  }

  if (range === 'weekly') {
    const currentStart = new Date(currentEnd.getTime() - 7 * MS_DAY)
    const previousEnd = currentStart
    const previousStart = new Date(previousEnd.getTime() - 7 * MS_DAY)
    const seriesStart = new Date(currentEnd.getTime() - 12 * 7 * MS_DAY)
    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      seriesStart,
      granularity: 'week',
    }
  }

  // monthly
  const currentStart = new Date(currentEnd.getTime() - 30 * MS_DAY)
  const previousEnd = currentStart
  const previousStart = new Date(previousEnd.getTime() - 30 * MS_DAY)
  const seriesStart = new Date(currentEnd.getTime() - 12 * 30 * MS_DAY)
  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    seriesStart,
    granularity: 'month',
  }
}

function emptyMetrics(): AnalyticsMetrics {
  return {
    followers: null,
    following: null,
    posts: null,
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    engagement: null,
    engagementRate: null,
  }
}

export function changePercent(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function metricsDelta(current: AnalyticsMetrics, previous: AnalyticsMetrics): AnalyticsMetrics {
  const keys = Object.keys(current) as Array<keyof AnalyticsMetrics>
  const delta = emptyMetrics()
  for (const key of keys) {
    const c = current[key]
    const p = previous[key]
    delta[key] = c !== null && p !== null ? c - p : null
  }
  return delta
}

export function metricsChangePercent(
  current: AnalyticsMetrics,
  previous: AnalyticsMetrics,
): Record<keyof AnalyticsMetrics, number | null> {
  const keys = Object.keys(current) as Array<keyof AnalyticsMetrics>
  const result = {} as Record<keyof AnalyticsMetrics, number | null>
  for (const key of keys) {
    result[key] = changePercent(current[key], previous[key])
  }
  return result
}

function lastInRange(
  points: AccountAnalyticsSeriesPoint[],
  start: Date,
  end: Date,
  field: keyof AccountAnalyticsSeriesPoint,
): number | null {
  let value: number | null = null
  for (const point of points) {
    if (point.date >= start && point.date < end) {
      const v = point[field]
      if (typeof v === 'number' && Number.isFinite(v)) value = v
    }
  }
  return value
}

function firstInRange(
  points: AccountAnalyticsSeriesPoint[],
  start: Date,
  end: Date,
  field: keyof AccountAnalyticsSeriesPoint,
): number | null {
  for (const point of points) {
    if (point.date >= start && point.date < end) {
      const v = point[field]
      if (typeof v === 'number' && Number.isFinite(v)) return v
    }
  }
  return null
}

function sumInRange(
  points: AccountAnalyticsSeriesPoint[],
  start: Date,
  end: Date,
  field: keyof AccountAnalyticsSeriesPoint,
): number | null {
  let total = 0
  let saw = false
  for (const point of points) {
    if (point.date >= start && point.date < end) {
      const v = point[field]
      if (typeof v === 'number' && Number.isFinite(v)) {
        total += v
        saw = true
      }
    }
  }
  return saw ? total : null
}

function engagementRate(engagement: number | null, reach: number | null, followers: number | null): number | null {
  if (engagement === null) return null
  if (reach !== null && reach > 0) return engagement / reach
  if (followers !== null && followers > 0) return engagement / followers
  return null
}

/** Build dashboard metrics for a period from series points (gauges = last, flows = sum, posts = delta). */
export function metricsFromSeries(
  points: AccountAnalyticsSeriesPoint[],
  start: Date,
  end: Date,
): AnalyticsMetrics {
  const followers = lastInRange(points, start, end, 'followerCount')
  const following = lastInRange(points, start, end, 'followingCount')
  const firstPosts = firstInRange(points, start, end, 'postsCount')
  const lastPosts = lastInRange(points, start, end, 'postsCount')
  const posts =
    typeof firstPosts === 'number' && typeof lastPosts === 'number'
      ? Math.max(0, lastPosts - firstPosts)
      : lastPosts

  const views = sumInRange(points, start, end, 'views')
  const reach = sumInRange(points, start, end, 'reach')
  const likes = sumInRange(points, start, end, 'likes')
  const comments = sumInRange(points, start, end, 'comments')
  const shares = sumInRange(points, start, end, 'shares')
  const saves = sumInRange(points, start, end, 'saves')
  const engagement = sumInRange(points, start, end, 'engagement')

  return {
    followers,
    following,
    posts,
    views,
    reach,
    likes,
    comments,
    shares,
    saves,
    engagement,
    engagementRate: engagementRate(engagement, reach, followers),
  }
}

export function toSeriesPoints(points: AccountAnalyticsSeriesPoint[]): AnalyticsSeriesPoint[] {
  return points.map(point => ({
    date: point.date.toISOString().slice(0, 10),
    followers: point.followerCount,
    views: point.views,
    reach: point.reach,
    engagement: point.engagement,
    posts: point.postsCount,
  }))
}

export function sumMetrics(rows: AnalyticsMetrics[]): AnalyticsMetrics {
  const result = emptyMetrics()
  const keys = Object.keys(result) as Array<keyof AnalyticsMetrics>

  for (const key of keys) {
    if (key === 'engagementRate') continue
    let total = 0
    let saw = false
    for (const row of rows) {
      const v = row[key]
      if (typeof v === 'number' && Number.isFinite(v)) {
        total += v
        saw = true
      }
    }
    result[key] = saw ? total : null
  }

  result.engagementRate = engagementRate(result.engagement, result.reach, result.followers)
  return result
}

export function emptyAnalyticsMetrics(): AnalyticsMetrics {
  return emptyMetrics()
}
