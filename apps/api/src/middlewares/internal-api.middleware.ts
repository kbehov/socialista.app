import { errorResponse } from '@/utils/http-response.js'
import { createMiddleware } from 'hono/factory'

export const internalApiMiddleware = createMiddleware(async (c, next) => {
  const configuredSecret = process.env.INTERNAL_API_SECRET
  const providedSecret = c.req.header('x-internal-api-secret')

  if (!configuredSecret) {
    console.error('[internal-api] INTERNAL_API_SECRET is not configured')
    return errorResponse(c, 500, 'Internal API secret is not configured')
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    return errorResponse(c, 401, 'Unauthorized')
  }

  await next()
})
