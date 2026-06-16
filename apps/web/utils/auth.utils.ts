import type { User } from '@socialista/types'
import type { JWT } from 'next-auth/jwt'

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

export function getSocialProfile(
  profile: Record<string, unknown> | null | undefined,
  fallback?: { email?: string | null; name?: string | null; image?: string | null },
) {
  const email = (typeof profile?.email === 'string' ? profile.email : fallback?.email) ?? undefined
  const name = (typeof profile?.name === 'string' ? profile.name : fallback?.name) ?? undefined
  const avatar =
    (typeof profile?.picture === 'string'
      ? profile.picture
      : typeof profile?.image === 'string'
        ? profile.image
        : typeof profile?.avatar_url === 'string'
          ? profile.avatar_url
          : fallback?.image) ?? undefined

  return { email, name, avatar }
}
