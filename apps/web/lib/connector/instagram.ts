import { z } from 'zod'

import { getInstagramConfig } from './config'
import { expiresAtFromSeconds, fetchJson } from './fetch'

const shortLivedSchema = z.union([
  z.object({
    access_token: z.string().min(1),
    user_id: z.union([z.string(), z.number()]),
    permissions: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  z.object({
    data: z
      .array(
        z.object({
          access_token: z.string().min(1),
          user_id: z.union([z.string(), z.number()]),
          permissions: z.union([z.string(), z.array(z.string())]).optional(),
        }),
      )
      .min(1),
  }),
])

const longLivedSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
})

const profileSchema = z.object({
  user_id: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  username: z.string().optional(),
  name: z.string().optional(),
  account_type: z.string().optional(),
  profile_picture_url: z.string().optional(),
  followers_count: z.number().optional(),
  biography: z.string().optional(),
})

function normalizePermissions(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map(s => s.trim()).filter(Boolean)
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

export function buildInstagramAuthorizeUrl(state: string): string {
  const { appId, scopes, redirectUri } = getInstagramConfig()
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(','))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeInstagramCode(code: string) {
  const { appId, appSecret, scopes, redirectUri } = getInstagramConfig()

  // Instagram may append "#_" to the code in the redirect URL.
  const cleanCode = code.replace(/#_$/, '')

  const shortRaw = await fetchJson('https://api.instagram.com/oauth/access_token', shortLivedSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: cleanCode,
    }),
  })

  const shortLived = 'data' in shortRaw ? shortRaw.data[0]! : shortRaw

  const longLived = await fetchJson('https://graph.instagram.com/access_token', longLivedSchema, {
    searchParams: {
      grant_type: 'ig_exchange_token',
      client_secret: appSecret,
      access_token: shortLived.access_token,
    },
  })

  const profile = await fetchJson('https://graph.instagram.com/v22.0/me', profileSchema, {
    searchParams: {
      fields: 'user_id,username,name,account_type,profile_picture_url,followers_count,biography',
      access_token: longLived.access_token,
    },
  })

  const igUserId = String(profile.user_id ?? profile.id ?? shortLived.user_id)
  const granted = normalizePermissions(shortLived.permissions)
  const resolvedScopes = granted.length > 0 ? granted : [...scopes]

  return {
    accessToken: longLived.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
    igUserId,
    scopes: resolvedScopes,
    accountName: profile.name || profile.username || 'Instagram Account',
    username: profile.username,
    accountAvatar: profile.profile_picture_url,
    biography: profile.biography,
    followersCount: profile.followers_count,
    accountType: profile.account_type,
  }
}
