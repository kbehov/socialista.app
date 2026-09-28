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
  normalizeInstagramPostInsights,
  type PostInsightsPayload,
} from './normalize.js'

const MEDIA_METRICS = [
  'views',
  'reach',
  'likes',
  'comments',
  'shares',
  'saved',
  'total_interactions',
] as const

const insightEntrySchema = z.object({
  name: z.string().optional(),
  period: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  total_value: z.object({ value: z.unknown().optional() }).optional(),
  values: z
    .array(z.object({ value: z.unknown().optional(), end_time: z.string().optional() }))
    .optional(),
})

const insightsSchema = z.object({
  data: z.array(insightEntrySchema).optional(),
})

function graphHost(account: IAccount): string {
  const tokenKind = account.metadata?.tokenKind
  if (tokenKind === 'instagram_user_access_token' || tokenKind === 'instagram_login') {
    return `https://graph.instagram.com/${graphVersion()}`
  }
  return `https://graph.facebook.com/${graphVersion()}`
}

function requireAccessToken(account: IAccount): string {
  if (!account.accessToken?.trim()) {
    throw new AnalyticsAuthError('Account is missing an access token')
  }
  return account.accessToken
}

async function fetchInsightsBatch(
  base: string,
  mediaId: string,
  accessToken: string,
  metrics: readonly string[],
): Promise<PostInsightsPayload> {
  return fetchJson(`${base}/${mediaId}/insights`, insightsSchema, {
    searchParams: {
      metric: metrics.join(','),
      period: 'lifetime',
      access_token: accessToken,
    },
  })
}

export async function fetchInstagramPostAnalytics(
  account: IAccount,
  providerPostId: string,
): Promise<{ raw: PostInsightsPayload; normalized: ReturnType<typeof normalizeInstagramPostInsights> }> {
  const accessToken = requireAccessToken(account)
  const base = graphHost(account)
  const mediaId = providerPostId.trim()

  let insights: PostInsightsPayload = { data: [] }
  try {
    insights = await fetchInsightsBatch(base, mediaId, accessToken, MEDIA_METRICS)
  } catch (error) {
    if (isUnsupportedMetricError(error)) {
      const data: NonNullable<PostInsightsPayload['data']> = []
      for (const metric of MEDIA_METRICS) {
        try {
          const partial = await fetchInsightsBatch(base, mediaId, accessToken, [metric])
          if (partial.data?.length) data.push(...partial.data)
        } catch (metricError) {
          if (metricError instanceof PublishHttpError && isUnsupportedMetricError(metricError)) {
            continue
          }
          if (metricError instanceof PublishHttpError) {
            classifyAnalyticsHttpError(metricError)
          }
          throw metricError
        }
      }
      insights = { data }
    } else {
      classifyAnalyticsHttpError(error)
    }
  }

  return {
    raw: insights,
    normalized: normalizeInstagramPostInsights(insights),
  }
}
