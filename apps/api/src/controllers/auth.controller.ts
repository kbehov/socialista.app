import { issueTokens } from '@/lib/jwt.js'
import {
  authenticateActiveUser,
  authenticateOrRegisterSocialUser,
  parseRefreshTokenInput,
  parseSignInInput,
  parseSignUpInput,
  parseSocialLoginInput,
  refreshAuthTokens,
  registerUser,
} from '@/utils/auth.utils.js'
import { successResponse } from '@/utils/http-response.js'
import { serializeUser } from '@/utils/user.utils.js'
import type { Context } from 'hono'

export const signUp = async (c: Context) => {
  const input = parseSignUpInput(await c.req.json())
  const user = await registerUser(input.email, input.password, input.name)
  const tokens = await issueTokens(user._id)
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
  const user = await authenticateOrRegisterSocialUser(input)
  const tokens = await issueTokens(user._id)
  return successResponse(c, 200, { user: serializeUser(user), ...tokens })
}
