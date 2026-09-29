import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'

import { getXConfig } from './config'
import { ConnectorError } from './errors'
import { expiresAtFromSeconds, fetchJson } from './fetch'

/** X user access tokens last 2 hours (7,200 seconds). */
const X_ACCESS_TOKEN_LIFETIME_SECONDS = 7200

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
})

const userMeSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
    username: z.string().optional(),
    profile_image_url: z.string().optional(),
    description: z.string().optional(),
    public_metrics: z
      .object({
        followers_count: z.number().optional(),
      })
      .optional(),
  }),
})

function parseScopes(scope: string | undefined, fallback: string[]): string[] {
  if (!scope) return [...fallback]
  return scope.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
}

function xBasicAuth(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
}

function upgradeXAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  return url.replace('_normal', '_400x400')
}

export function createXPkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

export function buildXAuthorizeUrl(state: string, codeChallenge: string): string {
  const { clientId, scopes, redirectUri } = getXConfig()
  const url = new URL('https://twitter.com/i/oauth2/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

async function requestXToken(body: URLSearchParams) {
  const { clientId, clientSecret } = getXConfig()
  body.set('client_id', clientId)
  return fetchJson('https://api.x.com/2/oauth2/token', tokenSchema, {
    method: 'POST',
    headers: {
      Authorization: xBasicAuth(clientId, clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
}

export async function exchangeXCode(code: string, codeVerifier: string) {
  const { redirectUri, scopes } = getXConfig()

  const token = await requestXToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  )

  const profile = await fetchJson('https://api.x.com/2/users/me', userMeSchema, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    searchParams: {
      'user.fields': 'id,name,username,profile_image_url,description,public_metrics',
    },
  })

  const user = profile.data

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, X_ACCESS_TOKEN_LIFETIME_SECONDS),
    xUserId: user.id,
    scopes: parseScopes(token.scope, scopes),
    accountName: user.name || user.username || 'X Account',
    username: user.username,
    accountAvatar: upgradeXAvatarUrl(user.profile_image_url),
    biography: user.description,
    followersCount: user.public_metrics?.followers_count,
  }
}

/** Refresh X access token using the stored refresh token. X rotates the refresh token on every refresh. */
export async function refreshXAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken?: string
  accessTokenExpiresAt: Date
}> {
  if (!refreshToken) {
    throw new ConnectorError('invalid_request', 'X account has no refresh token', 400)
  }

  const token = await requestXToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  )

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiresAt: expiresAtFromSeconds(token.expires_in, X_ACCESS_TOKEN_LIFETIME_SECONDS),
  }
}
