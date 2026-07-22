import { z } from 'zod'

import { getCallbackUrl, getTikTokConfig } from './config'
import { expiresAtFromSeconds, fetchJson } from './fetch'

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  open_id: z.string().min(1),
  refresh_token: z.string().optional(),
  refresh_expires_in: z.number().optional(),
  scope: z.string().optional(),
})

const userInfoSchema = z.object({
  data: z.object({
    user: z.object({
      avatar_url: z.string().optional(),
      display_name: z.string().optional(),
      username: z.string().optional(),
    }),
  }),
})

export function buildTikTokAuthorizeUrl(state: string): string {
  const { clientKey, scopes } = getTikTokConfig()
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.searchParams.set('client_key', clientKey)
  url.searchParams.set('scope', scopes.join(','))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', getCallbackUrl('tiktok'))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeTikTokCode(code: string) {
  const { clientKey, clientSecret } = getTikTokConfig()

  const token = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', tokenSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: getCallbackUrl('tiktok'),
    }),
  })

  const profile = await fetchJson('https://open.tiktokapis.com/v2/user/info/', userInfoSchema, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    searchParams: { fields: 'open_id,union_id,avatar_url,display_name,username' },
  })

  const user = profile.data.user

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, 24 * 60 * 60),
    refreshTokenExpiresAt: token.refresh_expires_in
      ? expiresAtFromSeconds(token.refresh_expires_in, 365 * 24 * 60 * 60)
      : undefined,
    openId: token.open_id,
    scopes: token.scope?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
    accountName: user.display_name || user.username || 'TikTok Account',
    username: user.username,
    accountAvatar: user.avatar_url,
  }
}

/** Refresh TikTok access token using the stored refresh token. */
export async function refreshTikTokAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken?: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt?: Date
}> {
  const { clientKey, clientSecret } = getTikTokConfig()

  const token = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', tokenSchema, {
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
