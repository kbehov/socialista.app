import { createStripeCustomer } from '@/lib/stripe.js'
import { issueTokens, verifyToken, type JwtUserPayload } from '@/lib/jwt.js'
import { HttpError } from '@/utils/http-response.js'
import { assertEmailUnique } from '@/utils/user.utils.js'
import { defaultWorkspaceBilling, defaultWorkspaceSettings } from '@/utils/workspace.utils.js'
import {
  authenticateUser,
  createUser,
  createWorkspace,
  getUserByEmail,
  getUserById,
  getUserByOAuthAccount,
  isValidEmail,
  isValidPassword,
  updateUser,
  updateWorkspace,
  UserStatus,
  type UserDocument,
} from '@socialista/db'

type SignUpBody = { email?: string; password?: string; name?: string }
type SignInBody = { email?: string; password?: string }
type RefreshTokenBody = { refreshToken?: string }
type SocialLoginBody = {
  provider?: string
  providerAccountId?: string
  email?: string
  name?: string
  avatar?: string
}

export type ParsedSocialLoginInput = {
  provider: string
  providerAccountId: string
  email: string
  name: string
  avatar?: string
}

export const parseSignUpInput = (body: SignUpBody) => {
  const { email, password, name } = body

  if (!email || !password || !name) {
    throw new HttpError(400, 'Email, password, and name are required')
  }
  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email address')
  }
  if (!isValidPassword(password)) {
    throw new HttpError(400, 'Password must be at least 8 characters')
  }

  return { email, password, name }
}

export const parseSignInInput = (body: SignInBody) => {
  const { email, password } = body

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required!')
  }

  return { email, password }
}

export const parseRefreshTokenInput = (body: RefreshTokenBody) => {
  const { refreshToken } = body

  if (!refreshToken) {
    throw new HttpError(400, 'Refresh token is required')
  }

  return { refreshToken }
}

export const parseSocialLoginInput = (body: SocialLoginBody): ParsedSocialLoginInput => {
  const { provider, providerAccountId, email, name, avatar } = body

  if (!provider || !providerAccountId || !email || !name) {
    throw new HttpError(400, 'provider, providerAccountId, email, and name are required')
  }
  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email address')
  }

  return {
    provider: provider.toLowerCase(),
    providerAccountId,
    email: email.toLowerCase(),
    name: name.trim(),
    avatar,
  }
}

export const refreshAuthTokens = async (refreshToken: string) => {
  let payload: JwtUserPayload

  try {
    payload = (await verifyToken(refreshToken, 'refresh')) as JwtUserPayload
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token')
  }

  const userId = payload.userId ?? payload.sub
  if (!userId) {
    throw new HttpError(401, 'Invalid refresh token')
  }

  const user = await getUserById(userId)
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid or expired refresh token')
  }

  return issueTokens(userId)
}

const linkOAuthAccount = async (user: UserDocument, provider: string, providerAccountId: string, avatar?: string) => {
  const alreadyLinked = user.oauthAccounts.some(
    account => account.provider === provider && account.providerAccountId === providerAccountId,
  )

  const updates: Parameters<typeof updateUser>[1] = { lastLoginAt: new Date() }
  if (!alreadyLinked) {
    updates.oauthAccounts = [...user.oauthAccounts, { provider, providerAccountId }]
  }
  if (avatar && !user.avatar) {
    updates.avatar = avatar
  }

  const updatedUser = await updateUser(user._id.toString(), updates)
  if (!updatedUser) {
    throw new HttpError(500, 'Failed to update user')
  }

  return updatedUser
}

export const authenticateOrRegisterSocialUser = async (input: ParsedSocialLoginInput) => {
  const { provider, providerAccountId, email, name, avatar } = input

  const existingOAuthUser = await getUserByOAuthAccount(provider, providerAccountId)
  if (existingOAuthUser) {
    if (existingOAuthUser.status !== UserStatus.ACTIVE) {
      throw new HttpError(401, 'Account is not active')
    }
    return linkOAuthAccount(existingOAuthUser, provider, providerAccountId, avatar)
  }

  const existingEmailUser = await getUserByEmail(email)
  if (existingEmailUser) {
    if (existingEmailUser.status !== UserStatus.ACTIVE) {
      throw new HttpError(401, 'Account is not active')
    }
    return linkOAuthAccount(existingEmailUser, provider, providerAccountId, avatar)
  }

  await assertEmailUnique(email)
  const user = await createUser({
    email,
    name,
    avatar,
    oauthAccounts: [{ provider, providerAccountId }],
  })
  await setupDefaultWorkspace(user, name)

  const updatedUser = await updateUser(user._id.toString(), { lastLoginAt: new Date() })
  if (!updatedUser) {
    throw new HttpError(500, 'Failed to update user')
  }

  return updatedUser
}

export const authenticateActiveUser = async (email: string, password: string) => {
  const user = await authenticateUser(email, password)
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid email or password')
  }
  return user
}

export const setupDefaultWorkspace = async (user: UserDocument, name: string): Promise<void> => {
  const workspace = await createWorkspace(
    { name: `${name.split(' ')[0]}'s Workspace`, billing: defaultWorkspaceBilling(), ...defaultWorkspaceSettings() },
    user._id,
  )

  const stripeCustomer = await createStripeCustomer(user.email, name, workspace._id.toString())

  await updateWorkspace(workspace._id.toString(), {
    billing: { ...defaultWorkspaceBilling(), stripeCustomerId: stripeCustomer.id },
  })
}

export const registerUser = async (email: string, password: string, name: string) => {
  await assertEmailUnique(email)
  const user = await createUser({ email, password, name })
  await setupDefaultWorkspace(user, name)
  return user
}
