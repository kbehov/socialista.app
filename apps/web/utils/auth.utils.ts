import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { User } from '@socialista/types'
import type { JWT } from 'next-auth/jwt'

type SearchParamReader = { get: (name: string) => string | null }

/** Safe relative post-login path. Defaults to dashboard when none is provided. */
export function resolveAuthCallbackUrl(searchParams: SearchParamReader): string {
  const raw = searchParams.get('callbackUrl') ?? searchParams.get('redirectUrl')
  if (raw?.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return DASHBOARD_ROUTES.ROOT
}

export function authPageHref(path: '/auth/signin' | '/auth/signup', callbackUrl: string): string {
  if (!callbackUrl || callbackUrl === DASHBOARD_ROUTES.ROOT) return path
  return `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000

export function mapApiUserToSessionUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.avatar ?? null,
    status: user.status,
    role: user.role,
  }
}

export function toIsoString(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString()
}

type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessExpiresAt: string | Date
  refreshExpiresAt: string | Date
}

export function applySessionUserToToken(
  token: JWT,
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    status?: string
    role?: string
  },
): JWT {
  if (user.name) token.name = user.name
  if (user.email) token.email = user.email
  if (user.image !== undefined) token.picture = user.image
  if (user.status) token.status = user.status
  if (user.role) token.role = user.role
  return token
}

export function applyAuthToToken(
  token: JWT,
  user: {
    id: string
    email: string
    name: string
    image?: string | null
    status?: string
    role?: string
  },
  auth: AuthTokens,
): JWT {
  token.id = user.id
  token.sub = user.id
  token.name = user.name
  token.email = user.email
  token.picture = user.image
  token.status = user.status
  token.role = user.role
  token.accessToken = auth.accessToken
  token.refreshToken = auth.refreshToken
  token.accessExpiresAt = toIsoString(auth.accessExpiresAt)
  token.refreshExpiresAt = toIsoString(auth.refreshExpiresAt)
  return token
}

export function shouldRefreshAccessToken(token: JWT): boolean {
  if (!token.accessExpiresAt || !token.refreshToken) {
    return false
  }

  const expiresAt = new Date(token.accessExpiresAt).getTime()
  if (Number.isNaN(expiresAt)) {
    return false
  }

  return Date.now() >= expiresAt - ACCESS_TOKEN_REFRESH_BUFFER_MS
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return undefined
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const parsed = asString(value)
    if (parsed) return parsed
  }
  return undefined
}

/** X OAuth 2.0 does not return email. Unique placeholder so social login can persist a User. */
export function twitterOauthPlaceholderEmail(providerAccountId: string): string {
  return `x.${providerAccountId}@users.noreply.socialista.app`
}

export function getSocialProfile(
  profile: Record<string, unknown> | null | undefined,
  fallback?: { email?: string | null; name?: string | null; image?: string | null },
) {
  const nested = asRecord(profile?.data)
  const email = firstString(profile?.email, nested?.email, fallback?.email)
  const name = firstString(profile?.name, nested?.name, nested?.username, profile?.username, fallback?.name)
  const avatar = firstString(
    profile?.picture,
    profile?.image,
    profile?.avatar_url,
    nested?.profile_image_url,
    fallback?.image,
  )
  const username = firstString(nested?.username, profile?.username)

  return {
    email,
    name,
    avatar: avatar?.replace('_normal', '_400x400') ?? avatar,
    username,
  }
}
