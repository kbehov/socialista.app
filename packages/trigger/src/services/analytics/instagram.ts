import type { IAccount } from '@socialista/db'
import { z } from 'zod'

import { PublishHttpError, fetchJson } from '../post-publishing/fetch.js'
import { graphVersion } from '../post-publishing/types.js'
import {
  AnalyticsAuthError,
  classifyAnalyticsHttpError,
  isUnsupportedMetricError,
} from './errors.js'
import type { InstagramAnalyticsRaw, InstagramInsightsPayload } from './normalize/instagram.js'

const FLOW_METRICS = [
  'views',
  'reach',
  'likes',
  'comments',
  'shares',
  'saves',
  'total_interactions',
  'profile_views',
  'website_clicks',
] as const

const profileSchema = z.object({
  id: z.string().optional(),
  followers_count: z.number().optional(),
  follows_count: z.number().optional(),
  media_count: z.number().optional(),
})

const insightEntrySchema = z.object({
  name: z.string().optional(),
  period: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  total_value: z.object({ value: z.number().optional() }).optional(),
  values: z
    .array(z.object({ value: z.number().optional(), end_time: z.string().optional() }))
    .optional(),
})

const insightsSchema = z.object({
  data: z.array(insightEntrySchema).optional(),
})

export type AnalyticsFetchWindow = {
  since: Date
  until: Date
}

function igUserId(account: IAccount): string {
  const fromMeta = account.metadata?.igUserId
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
  return account.providerAccountId
}

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

function unixSeconds(date: Date): string {
  return String(Math.floor(date.getTime() / 1000))
}

async function fetchInsightsBatch(
  base: string,
  userId: string,
  accessToken: string,
  metrics: readonly string[],
  window: AnalyticsFetchWindow,
): Promise<InstagramInsightsPayload> {
  return fetchJson(`${base}/${userId}/insights`, insightsSchema, {
    searchParams: {
      metric: metrics.join(','),
      metric_type: 'total_value',
      period: 'day',
      since: unixSeconds(window.since),
      until: unixSeconds(window.until),
      access_token: accessToken,
    },
  })
}

/**
 * Fetch Instagram profile gauges + optional day-window insights.
 * On unsupported-metric errors, retries each metric individually and merges results.
 */
export async function fetchInstagramAnalytics(
  account: IAccount,
  options: { includeFlows: boolean; window?: AnalyticsFetchWindow },
): Promise<InstagramAnalyticsRaw> {
  const accessToken = requireAccessToken(account)
  const base = graphHost(account)
  const userId = igUserId(account)

  let profile: z.infer<typeof profileSchema> | null = null
  try {
    profile = await fetchJson(`${base}/${userId}`, profileSchema, {
      searchParams: {
        fields: 'followers_count,follows_count,media_count',
        access_token: accessToken,
      },
    })
  } catch (error) {
    classifyAnalyticsHttpError(error)
  }

  if (!options.includeFlows || !options.window) {
    return { profile, insights: null }
  }

  let insights: InstagramInsightsPayload | null = null
  try {
    insights = await fetchInsightsBatch(base, userId, accessToken, FLOW_METRICS, options.window)
  } catch (error) {
    if (isUnsupportedMetricError(error)) {
      const data: NonNullable<InstagramInsightsPayload['data']> = []
      for (const metric of FLOW_METRICS) {
        try {
          const partial = await fetchInsightsBatch(base, userId, accessToken, [metric], options.window)
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

  return { profile, insights }
}
