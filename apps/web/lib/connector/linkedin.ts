import { z } from 'zod'

import { getLinkedInConfig } from './config'
import { expiresAtFromSeconds, fetchJson } from './fetch'

/** LinkedIn access tokens default to 2 months (5,184,000 seconds). */
const LINKEDIN_ACCESS_TOKEN_LIFETIME_SECONDS = 5_184_000

/** LinkedIn refresh tokens are typically valid for ~1 year. */
const LINKEDIN_REFRESH_TOKEN_LIFETIME_SECONDS = 365 * 24 * 60 * 60

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_token_expires_in: z.number().optional(),
  scope: z.string().optional(),
})

const userInfoSchema = z.object({
  sub: z.string().min(1),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string().optional(),
})

function parseScopes(scope: string | undefined, fallback: string[]): string[] {
  if (!scope) return [...fallback]
  return scope.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
}

export function buildLinkedInAuthorizeUrl(state: string): string {
  const { clientId, scopes, redirectUri } = getLinkedInConfig()
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('scope', scopes.join(' '))
  return url.toString()
}

export async function exchangeLinkedInCode(code: string) {
  const { clientId, clientSecret, redirectUri, scopes } = getLinkedInConfig()

  const token = await fetchJson('https://www.linkedin.com/oauth/v2/accessToken', tokenSchema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  const profile = await fetchJson('https://api.linkedin.com/v2/userinfo', userInfoSchema, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })

  const accountName =
    profile.name ||
    [profile.given_name, profile.family_name].filter(Boolean).join(' ') ||
    profile.email ||
    'LinkedIn Account'

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, LINKEDIN_ACCESS_TOKEN_LIFETIME_SECONDS),
    refreshTokenExpiresAt: token.refresh_token_expires_in
      ? expiresAtFromSeconds(token.refresh_token_expires_in, LINKEDIN_REFRESH_TOKEN_LIFETIME_SECONDS)
      : undefined,
    linkedInId: profile.sub,
    scopes: parseScopes(token.scope, scopes),
    accountName,
    username: profile.email,
    accountAvatar: profile.picture,
  }
}

/** Refresh LinkedIn access token using the stored refresh token. */
export async function refreshLinkedInAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken?: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt?: Date
}> {
  const { clientId, clientSecret } = getLinkedInConfig()

  const token = await fetchJson('https://www.linkedin.com/oauth/v2/accessToken', tokenSchema, {
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
