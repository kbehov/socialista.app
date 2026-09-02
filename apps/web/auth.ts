import { signInSchema } from '@/lib/zod/auth.schema'
import {
  refreshTokens as refreshTokensService,
  signIn as signInService,
  socialLogin as socialLoginService,
} from '@/services/auth.service'
import {
  applyAuthToToken,
  applySessionUserToToken,
  getSocialProfile,
  mapApiUserToSessionUser,
  shouldRefreshAccessToken,
  toIsoString,
} from '@/utils/auth.utils'
import type { Account, User as NextAuthUser, Profile } from 'next-auth'
import NextAuth, { CredentialsSignin } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET

class InvalidCredentialsError extends CredentialsSignin {
  code = 'invalid_credentials'
}

class SocialLoginError extends CredentialsSignin {
  code = 'social_login_failed'
}

const SOCIAL_TIMEZONE_COOKIE = 'socialista_tz'

async function readSocialTimezoneCookie(): Promise<string | undefined> {
  try {
    const { cookies } = await import('next/headers')
    const value = (await cookies()).get(SOCIAL_TIMEZONE_COOKIE)?.value
    if (!value) return undefined
    const decoded = decodeURIComponent(value).trim()
    return decoded || undefined
  } catch {
    return undefined
  }
}

const optionalSocialProviders = [
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    : null,
].filter((provider): provider is NonNullable<typeof provider> => provider !== null)

async function authenticateWithSocialProvider(
  account: Account,
  profile: Profile | undefined,
  user: NextAuthUser | undefined,
): Promise<JWT> {
  if (!account.providerAccountId) {
    throw new SocialLoginError('Missing provider account id')
  }

  const { email, name, avatar } = getSocialProfile(profile as Record<string, unknown> | undefined, {
    email: user?.email,
    name: user?.name,
    image: user?.image,
  })

  if (!email || !name) {
    throw new SocialLoginError('Social provider did not return required profile fields')
  }

  const timezone = await readSocialTimezoneCookie()

  const response = await socialLoginService({
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    email,
    name,
    avatar,
    timezone,
  })

  if (!response.success || !response.data) {
    throw new SocialLoginError(response.message)
  }

  const token: JWT = {}
  return applyAuthToToken(token, mapApiUserToSessionUser(response.data.user), response.data)
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return token
  }

  const response = await refreshTokensService(token.refreshToken)
  if (!response.success || !response.data) {
    token.error = 'RefreshTokenError'
    return token
  }

  const { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt } = response.data
  token.accessToken = accessToken
  token.refreshToken = refreshToken
  token.accessExpiresAt = toIsoString(accessExpiresAt)
  token.refreshExpiresAt = toIsoString(refreshExpiresAt)
  token.error = undefined

  return token
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async credentials => {
        const parsedCredentials = signInSchema.safeParse(credentials)
        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data
        const response = await signInService(email, password)

        if (!response.success || !response.data) {
          throw new InvalidCredentialsError(response.message)
        }

        const { user, accessToken, refreshToken, accessExpiresAt, refreshExpiresAt } = response.data

        return {
          ...mapApiUserToSessionUser(user),
          accessToken,
          refreshToken,
          accessExpiresAt: toIsoString(accessExpiresAt),
          refreshExpiresAt: toIsoString(refreshExpiresAt),
        }
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    ...optionalSocialProviders,
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider && account.provider !== 'credentials') {
        return authenticateWithSocialProvider(account, profile, user)
      }

      if (user?.accessToken && user.refreshToken && user.accessExpiresAt && user.refreshExpiresAt) {
        applyAuthToToken(
          token,
          {
            id: user.id,
            email: user.email ?? '',
            name: user.name ?? '',
            image: user.image ?? null,
            status: user.status,
            role: user.role,
          },
          {
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessExpiresAt: user.accessExpiresAt,
            refreshExpiresAt: user.refreshExpiresAt,
          },
        )
      }

      if (trigger === 'update' && session?.user) {
        applySessionUserToToken(token, session.user)
      }

      if (shouldRefreshAccessToken(token)) {
        return refreshAccessToken(token)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? ''
        if (token.name) session.user.name = token.name
        if (token.email) session.user.email = token.email
        if (token.picture !== undefined) {
          session.user.image = token.picture as string | null
        }
        session.user.status = token.status
        session.user.role = token.role
      }

      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessExpiresAt = token.accessExpiresAt
      session.refreshExpiresAt = token.refreshExpiresAt
      session.error = token.error

      return session
    },
  },
})
