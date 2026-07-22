import { z } from 'zod'

import { getCallbackUrl, getThreadsConfig } from './config'
import { expiresAtFromSeconds, fetchJson } from './fetch'

const shortLivedSchema = z.object({
  access_token: z.string().min(1),
})

const longLivedSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
})

const profileSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
  threads_profile_picture_url: z.string().optional(),
})

export function buildThreadsAuthorizeUrl(state: string): string {
  const { appId, scopes } = getThreadsConfig()
  const url = new URL('https://threads.net/oauth/authorize')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', getCallbackUrl('threads'))
  url.searchParams.set('scope', scopes.join(','))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeThreadsCode(code: string) {
  const { appId, appSecret, scopes } = getThreadsConfig()

  const shortLived = await fetchJson('https://graph.threads.net/oauth/access_token', shortLivedSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: getCallbackUrl('threads'),
      code,
    }),
  })

  const longLived = await fetchJson('https://graph.threads.net/access_token', longLivedSchema, {
    searchParams: {
      grant_type: 'th_exchange_token',
      client_secret: appSecret,
      access_token: shortLived.access_token,
    },
  })

  const profile = await fetchJson('https://graph.threads.net/v1.0/me', profileSchema, {
    searchParams: {
      fields: 'id,username,name,threads_profile_picture_url',
      access_token: longLived.access_token,
    },
  })

  return {
    accessToken: longLived.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
    threadsUserId: profile.id,
    scopes: [...scopes],
    accountName: profile.name || profile.username || 'Threads Account',
    username: profile.username,
    accountAvatar: profile.threads_profile_picture_url,
  }
}

/** Refresh a long-lived Threads User access token. */
export async function refreshThreadsAccessToken(accessToken: string): Promise<{
  accessToken: string
  accessTokenExpiresAt: Date
}> {
  const refreshed = await fetchJson('https://graph.threads.net/refresh_access_token', longLivedSchema, {
    searchParams: {
      grant_type: 'th_refresh_token',
      access_token: accessToken,
    },
  })

  return {
    accessToken: refreshed.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(refreshed.expires_in, 60 * 24 * 60 * 60),
  }
}
