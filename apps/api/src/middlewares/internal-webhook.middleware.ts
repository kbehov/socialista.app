import { errorResponse } from '@/utils/http-response.js'
import { createMiddleware } from 'hono/factory'

export const internalWebhookMiddleware = createMiddleware(async (c, next) => {
  const configuredSecret = process.env.POLAR_INTERNAL_WEBHOOK_SECRET
  const providedSecret = c.req.header('x-internal-webhook-secret')

  if (!configuredSecret) {
    console.error('[webhook] POLAR_INTERNAL_WEBHOOK_SECRET is not configured')
    return errorResponse(c, 500, 'Webhook secret is not configured')
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    return errorResponse(c, 401, 'Unauthorized')
  }

  await next()
})
