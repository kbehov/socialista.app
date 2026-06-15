import { sign, verify } from 'hono/jwt'
import { ACCESS_TTL_SEC, REFRESH_TTL_SEC } from '../config/api.config.js'

export type JwtUserPayload = {
  userId: string
  sub?: string
  exp: number
  iat: number
}

export const createToken = async (userId: string, type: 'access' | 'refresh', expiresIn: number) => {
  const secret = type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET
  if (secret == null || secret === '') {
    const name = type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET'
    throw new Error(`${name} must be set in the environment`)
  }
  const payload: JwtUserPayload = {
    userId,
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
  }
  return await sign(payload, secret, 'HS256')
}

export const verifyToken = async (token: string, type: 'access' | 'refresh') => {
  const secret = type === 'access' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET
  if (secret == null || secret === '') {
    const name = type === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET'
    throw new Error(`${name} must be set in the environment`)
  }
  return await verify(token, secret, 'HS256')
}

export async function issueTokens(userId: string) {
  const accessToken = await createToken(userId, 'access', ACCESS_TTL_SEC)
  const refreshToken = await createToken(userId, 'refresh', REFRESH_TTL_SEC)
  const accessExpiresAt = new Date(Date.now() + ACCESS_TTL_SEC * 1000)
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000)
  return { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt }
}
