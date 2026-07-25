import type { AppContext } from '@/middlewares/auth.middleware.js'
import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import { hasAnalyticsAccess, type IWorkspace } from '@socialista/db'
import { createMiddleware } from 'hono/factory'
import { isValidId } from '@socialista/db'

export type AnalyticsContext = {
  Variables: AppContext['Variables'] & {
    workspace: IWorkspace
    workspaceId: string
  }
}

/**
 * Requires JWT auth (applied upstream) + workspace membership + Pro/Enterprise active billing.
 * Sets `workspace` / `workspaceId` on the context for handlers.
 */
export const analyticsAccessMiddleware = createMiddleware<AnalyticsContext>(async (c, next) => {
  const workspaceId = c.req.param('workspaceId')
  if (!workspaceId || !isValidId(workspaceId)) {
    throw new HttpError(400, 'Invalid workspace ID')
  }

  const userId = c.get('userId')
  const workspace = await getWorkspaceAsMember(workspaceId, userId)

  if (!hasAnalyticsAccess(workspace)) {
    throw new HttpError(403, 'Analytics requires a Pro plan')
  }

  c.set('workspace', workspace)
  c.set('workspaceId', workspaceId)
  await next()
})
