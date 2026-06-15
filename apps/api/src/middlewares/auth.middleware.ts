import type { JwtUserPayload } from '@/lib/jwt.js'
import { verifyToken } from '@/lib/jwt.js'
import { errorResponse } from '@/utils/http-response.js'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export type AppContext = {
  Variables: {
    userId: string
  }
}

export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined
  const token = bearerToken || getCookie(c, 'token')

  if (!token) {
    return errorResponse(c, 401, 'Please login to continue')
  }

  try {
    const payload = (await verifyToken(token, 'access')) as JwtUserPayload
    const userId = payload.userId ?? payload.sub

    if (!userId) {
      return errorResponse(c, 401, 'Unauthorized')
    }

    c.set('userId', userId)
    await next()
  } catch {
    return errorResponse(c, 401, 'Invalid or expired token')
  }
})
