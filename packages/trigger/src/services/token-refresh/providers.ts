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

/** LinkedIn access tokens default to 2 months (5,184,000 seconds). */
const LINKEDIN_ACCESS_TOKEN_LIFETIME_SECONDS = 5_184_000

/** LinkedIn refresh tokens are typically valid for ~1 year. */
const LINKEDIN_REFRESH_TOKEN_LIFETIME_SECONDS = 365 * 24 * 60 * 60

const linkedInTokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_token_expires_in: z.number().optional(),
})

export async function refreshLinkedInAccessToken(refreshToken: string): Promise<RefreshedTokens> {
  const clientId = process.env.LINKEDIN_CLIENT_ID ?? ''
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET ?? ''

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn is not configured')
  }

  const token = await fetchJson('https://www.linkedin.com/oauth/v2/accessToken', linkedInTokenSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, LINKEDIN_ACCESS_TOKEN_LIFETIME_SECONDS),
    refreshTokenExpiresAt: token.refresh_token_expires_in
      ? expiresAtFromSeconds(token.refresh_token_expires_in, LINKEDIN_REFRESH_TOKEN_LIFETIME_SECONDS)
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
