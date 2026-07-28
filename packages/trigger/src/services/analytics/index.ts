import type { AnalyticsSnapshotMetrics, IAccount } from '@socialista/db'
import { SocialProvider } from '@socialista/db'

import { AnalyticsUnsupportedError } from './errors.js'
import { fetchFacebookAnalytics } from './facebook.js'
import { fetchInstagramAnalytics, type AnalyticsFetchWindow } from './instagram.js'
import {
  normalizeFacebookAnalytics,
  type FacebookAnalyticsRaw,
} from './normalize/facebook.js'
import {
  normalizeInstagramAnalytics,
  type InstagramAnalyticsRaw,
  type NormalizeInstagramResult,
} from './normalize/instagram.js'

export type AnalyticsFetchResult = {
  raw: InstagramAnalyticsRaw | FacebookAnalyticsRaw | Record<string, unknown>
  normalized: NormalizeInstagramResult
}

export type AnalyticsFetcher = (
  account: IAccount,
  options: { includeFlows: boolean; window?: AnalyticsFetchWindow },
) => Promise<AnalyticsFetchResult>

const instagramFetcher: AnalyticsFetcher = async (account, options) => {
  const raw = await fetchInstagramAnalytics(account, options)
  const normalized = normalizeInstagramAnalytics(raw, { expectFlows: options.includeFlows })
  return { raw, normalized }
}

const facebookFetcher: AnalyticsFetcher = async (account, options) => {
  const raw = await fetchFacebookAnalytics(account, options)
  const normalized = normalizeFacebookAnalytics(raw, { expectFlows: options.includeFlows })
  return { raw, normalized }
}

/** Providers with a working analytics fetcher. Extend as more platforms are added. */
export const ANALYTICS_FETCHERS: Partial<Record<SocialProvider, AnalyticsFetcher>> = {
  [SocialProvider.INSTAGRAM]: instagramFetcher,
  [SocialProvider.FACEBOOK]: facebookFetcher,
}

export const ANALYTICS_SUPPORTED_PROVIDERS: SocialProvider[] = Object.keys(
  ANALYTICS_FETCHERS,
) as SocialProvider[]

export async function fetchAccountAnalytics(
  account: IAccount,
  options: { includeFlows: boolean; window?: AnalyticsFetchWindow },
): Promise<AnalyticsFetchResult> {
  const fetcher = ANALYTICS_FETCHERS[account.provider]
  if (!fetcher) {
    throw new AnalyticsUnsupportedError(
      `Analytics is not supported for provider: ${account.provider}`,
    )
  }
  return fetcher(account, options)
}

export type { AnalyticsFetchWindow, AnalyticsSnapshotMetrics }
export {
  AnalyticsAuthError,
  AnalyticsUnsupportedError,
} from './errors.js'
export { normalizeFacebookAnalytics } from './normalize/facebook.js'
export { normalizeInstagramAnalytics } from './normalize/instagram.js'
