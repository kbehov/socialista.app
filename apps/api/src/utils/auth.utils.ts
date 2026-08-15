import { issueTokens, verifyToken, type JwtUserPayload } from '@/lib/jwt.js'
import { HttpError } from '@/utils/http-response.js'
import { assertEmailUnique } from '@/utils/user.utils.js'
import { defaultWorkspaceBilling, defaultWorkspaceSettings } from '@/utils/workspace.utils.js'
import {
  authenticateUser,
  clearPasswordResetToken,
  createUser,
  createWorkspace,
  findUserByPasswordResetToken,
  getPendingInvitationByEmail,
  getUserByEmail,
  getUserById,
  getUserByOAuthAccount,
  isValidEmail,
  isValidPassword,
  setPasswordResetToken,
  updateUser,
  UserStatus,
  type UserDocument,
} from '@socialista/db'
import { createHash, randomBytes } from 'node:crypto'

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
    return { user: await linkOAuthAccount(existingOAuthUser, provider, providerAccountId, avatar), isNew: false }
  }

  const existingEmailUser = await getUserByEmail(email)
  if (existingEmailUser) {
    if (existingEmailUser.status !== UserStatus.ACTIVE) {
      throw new HttpError(401, 'Account is not active')
    }
    return { user: await linkOAuthAccount(existingEmailUser, provider, providerAccountId, avatar), isNew: false }
  }

  const user = await createUser({
    email,
    name,
    avatar,
    oauthAccounts: [{ provider, providerAccountId }],
  })
  await setupWorkspaceUnlessInvited(user, name)

  const updatedUser = await updateUser(user._id.toString(), { lastLoginAt: new Date() })
  if (!updatedUser) {
    throw new HttpError(500, 'Failed to update user')
  }

  return { user: updatedUser, isNew: true }
}

export const authenticateActiveUser = async (email: string, password: string) => {
  const user = await authenticateUser(email, password)
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid email or password')
  }
  return user
}

export const setupDefaultWorkspace = async (user: UserDocument, name: string): Promise<void> => {
  await createWorkspace(
    { name: `${name.split(' ')[0]}'s Workspace`, billing: defaultWorkspaceBilling(), ...defaultWorkspaceSettings() },
    user._id,
  )
}

const setupWorkspaceUnlessInvited = async (user: UserDocument, name: string) => {
  const pendingInvite = await getPendingInvitationByEmail(user.email)
  if (pendingInvite) return
  await setupDefaultWorkspace(user, name)
}

export const registerUser = async (email: string, password: string, name: string) => {
  await assertEmailUnique(email)
  const user = await createUser({ email, password, name })
  await setupWorkspaceUnlessInvited(user, name)
  return user
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
const FORGOT_PASSWORD_MESSAGE = 'If an account exists for that email, we’ve sent a reset link.'

type ForgotPasswordBody = { email?: string }
type ResetPasswordBody = { token?: string; password?: string }

export const parseForgotPasswordInput = (body: ForgotPasswordBody) => {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !isValidEmail(email)) {
    throw new HttpError(400, 'Enter a valid email address')
  }
  return { email }
}

export const parseResetPasswordInput = (body: ResetPasswordBody) => {
  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token) {
    throw new HttpError(400, 'Reset token is required')
  }
  if (!isValidPassword(password)) {
    throw new HttpError(400, 'Password must be at least 8 characters')
  }

  return { token, password }
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createPasswordResetToken() {
  const token = randomBytes(32).toString('hex')
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  }
}

export const requestPasswordReset = async (email: string) => {
  const user = await getUserByEmail(email)
  if (!user || user.status !== UserStatus.ACTIVE) {
    return { user: null, token: null as string | null, expiresAt: null as Date | null }
  }

  const { token, tokenHash, expiresAt } = createPasswordResetToken()
  await setPasswordResetToken(user._id.toString(), tokenHash, expiresAt)
  return { user, token, expiresAt }
}

export const resetPasswordWithToken = async (token: string, password: string) => {
  const user = await findUserByPasswordResetToken(hashPasswordResetToken(token))
  if (!user) {
    throw new HttpError(400, 'This reset link is invalid or has expired')
  }

  const updated = await updateUser(user._id.toString(), { password })
  if (!updated) {
    throw new HttpError(500, 'Failed to update password')
  }

  await clearPasswordResetToken(user._id.toString())
}

export const forgotPasswordMessage = FORGOT_PASSWORD_MESSAGE
