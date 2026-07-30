import { createHmac } from 'node:crypto'

import { HttpError } from '@/utils/http-response.js'
import { ConnectionStatus, SocialProvider, type IAccount } from '@socialista/db'
import { supportsLocation, type LocationSearchResult } from '@socialista/types'

function graphVersion(): string {
  return process.env.META_GRAPH_VERSION ?? 'v24.0'
}

function requireMetaAppSecret(): { appId: string; appSecret: string } {
  const appId = process.env.META_APP_ID?.trim()
  const appSecret = process.env.META_APP_SECRET?.trim()
  if (!appId || !appSecret) {
    throw new HttpError(
      500,
      'Location search is not configured (missing META_APP_ID / META_APP_SECRET)',
    )
  }
  return { appId, appSecret }
}

function appSecretProof(accessToken: string, appSecret: string): string {
  return createHmac('sha256', appSecret).update(accessToken).digest('hex')
}

function requireConnectedAccount(account: IAccount): void {
  if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
    throw new HttpError(400, 'Account is not connected')
  }
}

function extractProviderError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const error = (payload as { error?: { message?: unknown } }).error
  if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }
  return fallback
}

async function fetchJsonPayload(url: URL): Promise<unknown> {
  const response = await fetch(url)
  const payload = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    throw new HttpError(502, extractProviderError(payload, 'Location search failed'))
  }
  return payload
}

function parseMetaPagesSearch(payload: unknown): LocationSearchResult[] {
  if (!payload || typeof payload !== 'object') {
    throw new HttpError(502, 'Unexpected location search response')
  }
  const data = (payload as { data?: unknown }).data
  if (!Array.isArray(data)) {
    throw new HttpError(502, 'Unexpected location search response')
  }

  const results: LocationSearchResult[] = []
  for (const raw of data) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as {
      id?: unknown
      name?: unknown
      location?: { city?: unknown; country?: unknown } | null
    }
    if (typeof item.id !== 'string' || !item.id.trim()) continue
    if (typeof item.name !== 'string' || !item.name.trim()) continue
    // Only Pages with physical location data are valid Instagram/Facebook place tags.
    if (!item.location || typeof item.location !== 'object') continue
    results.push({
      id: item.id.trim(),
      name: item.name.trim(),
      city: typeof item.location.city === 'string' ? item.location.city : undefined,
      country: typeof item.location.country === 'string' ? item.location.country : undefined,
    })
  }
  return results
}

function parseThreadsLocationSearch(payload: unknown): LocationSearchResult[] {
  if (!payload || typeof payload !== 'object') {
    throw new HttpError(502, 'Unexpected location search response')
  }
  const data = (payload as { data?: unknown }).data
  if (!Array.isArray(data)) {
    throw new HttpError(502, 'Unexpected location search response')
  }

  const results: LocationSearchResult[] = []
  for (const raw of data) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as {
      id?: unknown
      name?: unknown
      city?: unknown
      country?: unknown
    }
    if (typeof item.id !== 'string' || !item.id.trim()) continue
    if (typeof item.name !== 'string' || !item.name.trim()) continue
    results.push({
      id: item.id.trim(),
      name: item.name.trim(),
      city: typeof item.city === 'string' ? item.city : undefined,
      country: typeof item.country === 'string' ? item.country : undefined,
    })
  }
  return results
}

/**
 * Resolve a Meta token usable for Pages Search.
 * In development mode, an App token needs Page Public Metadata Access.
 * A Facebook User token with pages_read_engagement works without that feature.
 * We store the long-lived Meta user token in `refreshToken` at connect time.
 */
function resolveMetaPagesSearchToken(account: IAccount): {
  accessToken: string
  appSecret: string
} {
  const { appSecret } = requireMetaAppSecret()
  const userToken = account.refreshToken?.trim()
  if (userToken) {
    if (account.refreshTokenExpiresAt && account.refreshTokenExpiresAt.getTime() <= Date.now()) {
      throw new HttpError(
        400,
        'Meta user token expired. Reconnect this account via Facebook to refresh location search.',
      )
    }
    return { accessToken: userToken, appSecret }
  }

  const tokenKind =
    typeof account.metadata?.tokenKind === 'string' ? account.metadata.tokenKind : undefined

  if (tokenKind === 'instagram_login' || tokenKind === 'instagram_user_access_token') {
    throw new HttpError(
      400,
      'Location search needs a Facebook Login connection (or Page Public Metadata Access on your Meta app). Reconnect this Instagram account via Facebook, or connect a Facebook Page in the same workspace.',
    )
  }

  throw new HttpError(
    400,
    'Location search needs a Meta user token. Disconnect and reconnect this account via Facebook to enable it.',
  )
}

async function fetchMetaPagesSearch(
  account: IAccount,
  query: string,
): Promise<LocationSearchResult[]> {
  const { accessToken, appSecret } = resolveMetaPagesSearchToken(account)
  const url = new URL(`https://graph.facebook.com/${graphVersion()}/pages/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('fields', 'id,name,location{city,country}')
  url.searchParams.set('access_token', accessToken)
  // Required by Meta when calling Pages Search with a User access token from the server.
  url.searchParams.set('appsecret_proof', appSecretProof(accessToken, appSecret))
  return parseMetaPagesSearch(await fetchJsonPayload(url))
}

async function fetchThreadsLocationSearch(
  account: IAccount,
  query: string,
): Promise<LocationSearchResult[]> {
  const token = account.accessToken?.trim()
  if (!token) {
    throw new HttpError(400, 'Account is missing an access token')
  }
  if (account.accessTokenExpiresAt && account.accessTokenExpiresAt.getTime() <= Date.now()) {
    throw new HttpError(400, 'Account access token has expired')
  }

  const url = new URL('https://graph.threads.net/v1.0/location_search')
  url.searchParams.set('query', query)
  url.searchParams.set('fields', 'id,name,city,country')
  url.searchParams.set('access_token', token)
  return parseThreadsLocationSearch(await fetchJsonPayload(url))
}

/** Search provider place/location APIs for an account that supports location tagging. */
export async function searchAccountLocations(
  account: IAccount,
  query: string,
): Promise<LocationSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return []
  }
  if (!supportsLocation(account.provider)) {
    throw new HttpError(400, `${account.provider} does not support location tagging`)
  }

  requireConnectedAccount(account)

  switch (account.provider) {
    case SocialProvider.FACEBOOK:
    case SocialProvider.INSTAGRAM:
      return fetchMetaPagesSearch(account, trimmed)
    case SocialProvider.THREADS:
      return fetchThreadsLocationSearch(account, trimmed)
    default:
      throw new HttpError(400, `${account.provider} does not support location tagging`)
  }
}
