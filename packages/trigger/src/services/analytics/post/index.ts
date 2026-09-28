import type { IAccount, PostAnalyticsMetrics } from '@socialista/db'
import { SocialProvider } from '@socialista/db'

import { AnalyticsUnsupportedError } from '../errors.js'
import { fetchFacebookPostAnalytics } from './facebook.js'
import { fetchInstagramPostAnalytics } from './instagram.js'
import type { PostInsightsPayload } from './normalize.js'

export type PostAnalyticsFetchResult = {
  raw: PostInsightsPayload
  normalized: { metrics: PostAnalyticsMetrics; missingMetrics: string[] }
}

export type PostAnalyticsFetcher = (
  account: IAccount,
  providerPostId: string,
) => Promise<PostAnalyticsFetchResult>

const instagramFetcher: PostAnalyticsFetcher = async (account, providerPostId) => {
  return fetchInstagramPostAnalytics(account, providerPostId)
}

const facebookFetcher: PostAnalyticsFetcher = async (account, providerPostId) => {
  return fetchFacebookPostAnalytics(account, providerPostId)
}

export const POST_ANALYTICS_FETCHERS: Partial<Record<SocialProvider, PostAnalyticsFetcher>> = {
  [SocialProvider.INSTAGRAM]: instagramFetcher,
  [SocialProvider.FACEBOOK]: facebookFetcher,
}

export async function fetchPostAnalytics(
  account: IAccount,
  providerPostId: string,
): Promise<PostAnalyticsFetchResult> {
  const fetcher = POST_ANALYTICS_FETCHERS[account.provider]
  if (!fetcher) {
    throw new AnalyticsUnsupportedError(
      `Post analytics is not supported for provider: ${account.provider}`,
    )
  }
  return fetcher(account, providerPostId)
}

export {
  AnalyticsAuthError,
  AnalyticsUnsupportedError,
} from '../errors.js'
