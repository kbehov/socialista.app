import type { IAccount } from '@socialista/db'
import { z } from 'zod'

import { PublishHttpError, fetchJson } from '../../post-publishing/fetch.js'
import { graphVersion } from '../../post-publishing/types.js'
import {
  AnalyticsAuthError,
  classifyAnalyticsHttpError,
  isUnsupportedMetricError,
} from '../errors.js'
import {
  normalizeFacebookPostInsights,
  type PostInsightValue,
  type PostInsightsPayload,
} from './normalize.js'

/**
 * Lifetime Page Post Insights (post–Nov 2025).
 * `post_impressions*` are deprecated; fetch metrics one at a time so one
 * unsupported name cannot wipe the rest.
 */
const POST_METRICS = [
  'post_media_view',
  'post_media_view_unique',
  'post_reactions_like_total',
  'post_activity_by_action_type',
  'post_video_views',
] as const

const looseInsightsSchema = z.unknown()

function requireAccessToken(account: IAccount): string {
  if (!account.accessToken?.trim()) {
    throw new AnalyticsAuthError('Account is missing an access token')
  }
  return account.accessToken
}

function graphBase(): string {
  return `https://graph.facebook.com/${graphVersion()}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function coerceInsightsPayload(payload: unknown): PostInsightsPayload {
  const root = asRecord(payload)
  const rawData = root?.data
  if (!Array.isArray(rawData)) return { data: [] }

  const data: PostInsightValue[] = []
  for (const entry of rawData) {
    const record = asRecord(entry)
    if (!record) continue

    const values: NonNullable<PostInsightValue['values']> = []
    if (Array.isArray(record.values)) {
      for (const point of record.values) {
        const pointRecord = asRecord(point)
        if (!pointRecord) continue
        values.push({
          value: pointRecord.value,
          end_time: typeof pointRecord.end_time === 'string' ? pointRecord.end_time : undefined,
        })
      }
    }

    const totalValue = asRecord(record.total_value)
    if (values.length === 0 && totalValue && 'value' in totalValue) {
      values.push({ value: totalValue.value })
    }

    data.push({
      name: typeof record.name === 'string' ? record.name : undefined,
      period: typeof record.period === 'string' ? record.period : undefined,
      title: typeof record.title === 'string' ? record.title : undefined,
      description: typeof record.description === 'string' ? record.description : undefined,
      total_value: totalValue ?? undefined,
      values,
    })
  }

  return { data }
}

function isSkippableInsightsError(error: unknown): boolean {
  if (!(error instanceof PublishHttpError)) return false
  if (isUnsupportedMetricError(error)) return true
  if (error.message === 'Unexpected provider response') return true
  if (/invalid metric|does not support|unknown metric|cannot be fetched/i.test(error.message)) {
    return true
  }
  return false
}

async function fetchInsightsMetric(
  postId: string,
  accessToken: string,
  metric: string,
): Promise<PostInsightsPayload> {
  const raw = await fetchJson(`${graphBase()}/${postId}/insights`, looseInsightsSchema, {
    searchParams: {
      metric,
      period: 'lifetime',
      access_token: accessToken,
    },
  })
  return coerceInsightsPayload(raw)
}

export async function fetchFacebookPostAnalytics(
  account: IAccount,
  providerPostId: string,
): Promise<{ raw: PostInsightsPayload; normalized: ReturnType<typeof normalizeFacebookPostInsights> }> {
  const accessToken = requireAccessToken(account)
  const postId = providerPostId.trim()

  const data: NonNullable<PostInsightsPayload['data']> = []
  let authError: unknown = null

  for (const metric of POST_METRICS) {
    try {
      const partial = await fetchInsightsMetric(postId, accessToken, metric)
      if (partial.data?.length) data.push(...partial.data)
    } catch (metricError) {
      if (isSkippableInsightsError(metricError)) continue
      if (metricError instanceof PublishHttpError) {
        try {
          classifyAnalyticsHttpError(metricError)
        } catch (classified) {
          if (classified instanceof AnalyticsAuthError) {
            authError = classified
            break
          }
          continue
        }
      }
      throw metricError
    }
  }

  if (authError) throw authError

  const insights = { data }
  return {
    raw: insights,
    normalized: normalizeFacebookPostInsights(insights),
  }
}
