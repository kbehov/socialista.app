import type { IAccount } from '@socialista/db'
import { z } from 'zod'

import { PublishHttpError, fetchJson } from '../post-publishing/fetch.js'
import { graphVersion } from '../post-publishing/types.js'
import {
  AnalyticsAuthError,
  classifyAnalyticsHttpError,
  isUnsupportedMetricError,
} from './errors.js'
import type { AnalyticsFetchWindow } from './instagram.js'
import type {
  FacebookAnalyticsRaw,
  FacebookInsightValue,
  FacebookInsightsPayload,
} from './normalize/facebook.js'

/**
 * Current Page Insights metrics (post–Nov 2025).
 * `page_impressions*` / `page_impressions_unique*` are deprecated for all API versions.
 * `page_positive_feedback_by_type` supplies comment/share breakdowns when available.
 * Saves are not exposed at Page level.
 */
const FLOW_METRICS = [
  'page_media_view',
  'page_total_media_view_unique',
  'page_actions_post_reactions_like_total',
  'page_post_engagements',
  'page_positive_feedback_by_type',
  'page_views_total',
] as const

const pageSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  followers_count: z.number().optional(),
  fan_count: z.number().optional(),
})

/** Accept any JSON — Meta insights shapes vary by metric / version. */
const looseInsightsSchema = z.unknown()

function requireAccessToken(account: IAccount): string {
  if (!account.accessToken?.trim()) {
    throw new AnalyticsAuthError('Account is missing an access token')
  }
  return account.accessToken
}

/** Meta Page Insights since/until are most reliable as YYYY-MM-DD (until exclusive). */
function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function graphBase(): string {
  return `https://graph.facebook.com/${graphVersion()}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

/** Coerce a raw Graph insights payload into our normalizer shape. */
function coerceInsightsPayload(payload: unknown): FacebookInsightsPayload {
  const root = asRecord(payload)
  const rawData = root?.data
  if (!Array.isArray(rawData)) return { data: [] }

  const data: FacebookInsightValue[] = []
  for (const entry of rawData) {
    const record = asRecord(entry)
    if (!record) continue

    const name = typeof record.name === 'string' ? record.name : undefined
    const period = typeof record.period === 'string' ? record.period : undefined
    const title = typeof record.title === 'string' ? record.title : undefined
    const description =
      typeof record.description === 'string' ? record.description : undefined

    const values: NonNullable<FacebookInsightValue['values']> = []
    if (Array.isArray(record.values)) {
      for (const point of record.values) {
        const pointRecord = asRecord(point)
        if (!pointRecord) continue
        values.push({
          value: pointRecord.value,
          end_time:
            typeof pointRecord.end_time === 'string' ? pointRecord.end_time : undefined,
        })
      }
    }

    // Some newer metrics return total_value instead of (or in addition to) values[].
    const totalValue = asRecord(record.total_value)
    if (values.length === 0 && totalValue && 'value' in totalValue) {
      values.push({ value: totalValue.value })
    }

    data.push({ name, period, title, description, values })
  }

  return { data }
}

function isSkippableInsightsError(error: unknown): boolean {
  if (!(error instanceof PublishHttpError)) return false
  if (isUnsupportedMetricError(error)) return true
  // Schema / shape mismatches — skip the metric, don't fail the whole fetch.
  if (error.message === 'Unexpected provider response') return true
  // (#100) invalid parameter / metric errors already covered; also catch phrasing variants.
  if (/invalid metric|does not support|unknown metric|cannot be fetched/i.test(error.message)) {
    return true
  }
  return false
}

async function fetchInsightsMetric(
  pageId: string,
  accessToken: string,
  metric: string,
  window: AnalyticsFetchWindow,
): Promise<FacebookInsightsPayload> {
  const raw = await fetchJson(`${graphBase()}/${pageId}/insights`, looseInsightsSchema, {
    searchParams: {
      metric,
      period: 'day',
      since: toDateParam(window.since),
      until: toDateParam(window.until),
      access_token: accessToken,
    },
  })
  return coerceInsightsPayload(raw)
}

/**
 * Fetch Facebook Page gauges + optional day-window insights.
 * Fetches metrics individually so one deprecated/unsupported metric cannot wipe the batch.
 */
export async function fetchFacebookAnalytics(
  account: IAccount,
  options: { includeFlows: boolean; window?: AnalyticsFetchWindow },
): Promise<FacebookAnalyticsRaw> {
  const accessToken = requireAccessToken(account)
  const pageId = account.providerAccountId

  let page: z.infer<typeof pageSchema> | null = null
  try {
    page = await fetchJson(`${graphBase()}/${pageId}`, pageSchema, {
      searchParams: {
        fields: 'followers_count,fan_count',
        access_token: accessToken,
      },
    })
  } catch (error) {
    classifyAnalyticsHttpError(error)
  }

  if (!options.includeFlows || !options.window) {
    return {
      page: page
        ? {
            id: page.id !== undefined ? String(page.id) : undefined,
            followers_count: page.followers_count,
            fan_count: page.fan_count,
          }
        : null,
      insights: null,
    }
  }

  const data: NonNullable<FacebookInsightsPayload['data']> = []
  let authError: unknown = null

  for (const metric of FLOW_METRICS) {
    try {
      const partial = await fetchInsightsMetric(pageId, accessToken, metric, options.window)
      if (partial.data?.length) data.push(...partial.data)
    } catch (metricError) {
      if (isSkippableInsightsError(metricError)) {
        continue
      }
      if (metricError instanceof PublishHttpError) {
        try {
          classifyAnalyticsHttpError(metricError)
        } catch (classified) {
          if (classified instanceof AnalyticsAuthError) {
            authError = classified
            break
          }
          // Non-auth HTTP errors for a single metric — skip and keep other metrics.
          continue
        }
      }
      throw metricError
    }
  }

  if (authError) throw authError

  return {
    page: page
      ? {
          id: page.id !== undefined ? String(page.id) : undefined,
          followers_count: page.followers_count,
          fan_count: page.fan_count,
        }
      : null,
    insights: { data },
  }
}
