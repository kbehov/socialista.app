/**
 * MVP anomaly detection for analytics series.
 *
 * Flags spikes/drops when a value (or day-over-day follower delta) diverges
 * from a short rolling average by more than THRESHOLD_PERCENT. Intentionally
 * simple — iterate with z-scores / seasonal baselines later if needed.
 */
import type {
  AnalyticsAnomaly,
  AnalyticsAnomalyMetric,
  AnalyticsSeriesPoint,
  SocialProvider,
} from '@socialista/types'

const WINDOW_DAYS = 7
const MIN_SAMPLES = 3
const MIN_BASELINE = 1
const THRESHOLD_PERCENT = 40
const CRITICAL_MULTIPLIER = 2

type DetectOptions = {
  provider?: SocialProvider | null
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  let total = 0
  for (const value of values) total += value
  return total / values.length
}

function detectOnSeries(
  points: Array<{ date: string; value: number | null }>,
  metric: AnalyticsAnomalyMetric,
  provider: SocialProvider | null,
): AnalyticsAnomaly[] {
  const anomalies: AnalyticsAnomaly[] = []

  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    if (!point || point.value === null || !Number.isFinite(point.value)) continue

    const windowStart = Math.max(0, i - WINDOW_DAYS)
    const baselineValues: number[] = []
    for (let j = windowStart; j < i; j++) {
      const prior = points[j]
      if (prior && prior.value !== null && Number.isFinite(prior.value)) {
        baselineValues.push(prior.value)
      }
    }

    if (baselineValues.length < MIN_SAMPLES) continue

    const baseline = mean(baselineValues)
    if (baseline === null || Math.abs(baseline) < MIN_BASELINE) continue

    const changePercent = ((point.value - baseline) / Math.abs(baseline)) * 100
    const absChange = Math.abs(changePercent)
    if (absChange < THRESHOLD_PERCENT) continue

    anomalies.push({
      metric,
      provider,
      date: point.date,
      value: point.value,
      baseline,
      changePercent,
      direction: changePercent >= 0 ? 'spike' : 'drop',
      severity: absChange >= THRESHOLD_PERCENT * CRITICAL_MULTIPLIER ? 'critical' : 'warning',
    })
  }

  return anomalies
}

/** Day-over-day deltas for a monotonic gauge (followers). */
function followerDeltas(series: AnalyticsSeriesPoint[]): Array<{ date: string; value: number | null }> {
  const deltas: Array<{ date: string; value: number | null }> = []
  let previous: number | null = null

  for (const point of series) {
    if (point.followers === null || !Number.isFinite(point.followers)) {
      deltas.push({ date: point.date, value: null })
      continue
    }
    if (previous === null) {
      deltas.push({ date: point.date, value: null })
      previous = point.followers
      continue
    }
    deltas.push({ date: point.date, value: point.followers - previous })
    previous = point.followers
  }

  return deltas
}

/** Detect spikes/drops across key metrics on a chart-ready series. */
export function detectAnomalies(
  series: AnalyticsSeriesPoint[],
  options: DetectOptions = {},
): AnalyticsAnomaly[] {
  const provider = options.provider ?? null

  return [
    ...detectOnSeries(followerDeltas(series), 'followers', provider),
    ...detectOnSeries(
      series.map(p => ({ date: p.date, value: p.reach })),
      'reach',
      provider,
    ),
    ...detectOnSeries(
      series.map(p => ({ date: p.date, value: p.views })),
      'views',
      provider,
    ),
    ...detectOnSeries(
      series.map(p => ({ date: p.date, value: p.engagement })),
      'engagement',
      provider,
    ),
  ].sort((a, b) => b.date.localeCompare(a.date) || Math.abs(b.changePercent) - Math.abs(a.changePercent))
}
