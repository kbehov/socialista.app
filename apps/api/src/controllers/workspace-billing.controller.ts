import { errorResponse, successResponse } from '@/utils/http-response.js'
import { parsePolarWebhookEvent, processPolarWebhookEvent } from '@/utils/polar-billing.utils.js'
import { getWorkspaceById } from '@socialista/db'
import type { Context } from 'hono'

export const processPolarBillingWebhook = async (c: Context) => {
  const event = parsePolarWebhookEvent(await c.req.json())
  console.log('event', event)
  const handled = await processPolarWebhookEvent(event)

  return successResponse(c, 200, {
    received: true,
    handled,
    event: event.type,
  })
}

export const getWorkspaceBilling = async (c: Context) => {
  const workspaceId = c.req.param('workspaceId')
  if (!workspaceId) {
    return errorResponse(c, 400, 'Workspace ID is required')
  }
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) {
    return errorResponse(c, 404, 'Workspace not found')
  }
  return successResponse(c, 200, workspace.billing)
}
