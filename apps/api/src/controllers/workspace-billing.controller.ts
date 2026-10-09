import { successResponse } from '@/utils/http-response.js'
import { parsePolarWebhookEvent, processPolarWebhookEvent } from '@/services/polar-billing.service.js'
import type { Context } from 'hono'

export const processPolarBillingWebhook = async (c: Context) => {
  const event = parsePolarWebhookEvent(await c.req.json())
  const handled = await processPolarWebhookEvent(event)

  return successResponse(c, 200, {
    received: true,
    handled,
    event: event.type,
  })
}
