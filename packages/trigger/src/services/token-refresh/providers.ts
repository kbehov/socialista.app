import { z } from 'zod'

import { expiresAtFromSeconds, fetchJson } from './fetch.js'

const longLivedSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
})

const tikTokTokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_expires_in: z.number().optional(),
})

export type RefreshedTokens = {
  accessToken: string
  accessTokenExpiresAt: Date
  refreshToken?: string
  refreshTokenExpiresAt?: Date
}

export async function refreshInstagramAccessToken(accessToken: string): Promise<RefreshedTokens> {
  const refreshed = await fetchJson('https://graph.instagram.com/refresh_access_token', longLivedSchema, {
    searchParams: {
      grant_type: 'ig_refresh_token',
      access_token: accessToken,
    },
  })

  return {
    accessToken: refreshed.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(refreshed.expires_in, 60 * 24 * 60 * 60),
  }
}

export async function refreshThreadsAccessToken(accessToken: string): Promise<RefreshedTokens> {
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

export async function refreshTikTokAccessToken(refreshToken: string): Promise<RefreshedTokens> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY ?? ''
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET ?? ''

  if (!clientKey || !clientSecret) {
    throw new Error('TikTok is not configured')
  }

  const token = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', tikTokTokenSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, 24 * 60 * 60),
    refreshTokenExpiresAt: token.refresh_expires_in
      ? expiresAtFromSeconds(token.refresh_expires_in, 365 * 24 * 60 * 60)
      : undefined,
  }
}

export async function refreshMetaUserAccessToken(accessToken: string): Promise<RefreshedTokens> {
  const appId = process.env.META_APP_ID ?? ''
  const appSecret = process.env.META_APP_SECRET ?? ''
  const graphVersion = process.env.META_GRAPH_VERSION ?? 'v22.0'

  if (!appId || !appSecret) {
    throw new Error('Meta is not configured')
  }

  const longLived = await fetchJson(
    `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
    longLivedSchema,
    {
      searchParams: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: accessToken,
      },
    },
  )

  return {
    accessToken: longLived.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
  }
}
