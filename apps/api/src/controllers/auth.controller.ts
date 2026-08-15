import { issueTokens } from '@/lib/jwt.js'
import {
  authenticateActiveUser,
  authenticateOrRegisterSocialUser,
  forgotPasswordMessage,
  parseForgotPasswordInput,
  parseRefreshTokenInput,
  parseResetPasswordInput,
  parseSignInInput,
  parseSignUpInput,
  parseSocialLoginInput,
  refreshAuthTokens,
  registerUser,
  requestPasswordReset,
  resetPasswordWithToken,
} from '@/utils/auth.utils.js'
import { dispatchEmail } from '@/utils/email.utils.js'
import { successResponse } from '@/utils/http-response.js'
import { serializeUser } from '@/utils/user.utils.js'
import { getAppUrl, sendPasswordResetEmail, sendWelcomeEmail } from '@socialista/email'
import type { Context } from 'hono'

export const signUp = async (c: Context) => {
  const input = parseSignUpInput(await c.req.json())
  const user = await registerUser(input.email, input.password, input.name)
  const tokens = await issueTokens(user._id)
  await dispatchEmail('welcome', () => sendWelcomeEmail({ to: user.email, name: user.name }))
  return successResponse(c, 201, { user: serializeUser(user), ...tokens })
}

export const signIn = async (c: Context) => {
  const { email, password } = parseSignInInput(await c.req.json())
  const user = await authenticateActiveUser(email, password)
  const tokens = await issueTokens(user._id)
  return successResponse(c, 200, { user: serializeUser(user), ...tokens })
}

export const refreshTokens = async (c: Context) => {
  const { refreshToken } = parseRefreshTokenInput(await c.req.json())
  const tokens = await refreshAuthTokens(refreshToken)
  return successResponse(c, 200, tokens)
}

export const socialLogin = async (c: Context) => {
  const input = parseSocialLoginInput(await c.req.json())
  const { user, isNew } = await authenticateOrRegisterSocialUser(input)
  const tokens = await issueTokens(user._id)
  if (isNew) {
    await dispatchEmail('welcome', () => sendWelcomeEmail({ to: user.email, name: user.name }))
  }
  return successResponse(c, 200, { user: serializeUser(user), ...tokens })
}

export const forgotPassword = async (c: Context) => {
  const { email } = parseForgotPasswordInput(await c.req.json())
  const { user, token, expiresAt } = await requestPasswordReset(email)

  if (user && token && expiresAt) {
    await dispatchEmail('password-reset', () =>
      sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`,
        expiresAt,
      }),
    )
  }

  return successResponse(c, 200, { message: forgotPasswordMessage })
}

export const resetPassword = async (c: Context) => {
  const { token, password } = parseResetPasswordInput(await c.req.json())
  await resetPasswordWithToken(token, password)
  return successResponse(c, 200, { message: 'Your password has been updated.' })
}
