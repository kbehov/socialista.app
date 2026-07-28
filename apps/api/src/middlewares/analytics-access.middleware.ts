import type { AppContext } from '@/middlewares/auth.middleware.js'
import { HttpError } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import { hasAnalyticsAccess, isValidId, type IWorkspace } from '@socialista/db'
import { createMiddleware } from 'hono/factory'

export type AnalyticsContext = {
  Variables: AppContext['Variables'] & {
    workspace: IWorkspace
    workspaceId: string
  }
}

/**
 * Membership only: validates workspaceId, resolves membership, and sets
 * `workspace` / `workspaceId` on the context. Does not gate on plan.
 */
export const analyticsWorkspaceMiddleware = createMiddleware<AnalyticsContext>(async (c, next) => {
  const workspaceId = c.req.param('workspaceId')
  if (!workspaceId || !isValidId(workspaceId)) {
    throw new HttpError(400, 'Invalid workspace ID')
  }

  const userId = c.get('userId')
  const workspace = await getWorkspaceAsMember(workspaceId, userId)

  c.set('workspace', workspace)
  c.set('workspaceId', workspaceId)
  await next()
})

/**
 * Plan gate. Runs after analyticsWorkspaceMiddleware; reads c.get('workspace').
 * Pro / Enterprise with active billing required.
 */
export const requireAnalyticsAccess = createMiddleware<AnalyticsContext>(async (c, next) => {
  if (!hasAnalyticsAccess(c.get('workspace'))) {
    throw new HttpError(403, 'Analytics requires a Pro plan')
  }
  await next()
})

/**
 * @deprecated Prefer analyticsWorkspaceMiddleware + requireAnalyticsAccess.
 * Kept as a convenience that applies both (membership + plan).
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
