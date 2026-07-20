import { auth } from '@/auth'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { WorkspaceResponse } from '@socialista/types'

import { SocialConnectError } from './errors'

export type ConnectSession = {
  userId: string
  accessToken: string
  workspace: WorkspaceResponse
  workspaceId: string
}

export async function requireConnectSession(): Promise<ConnectSession> {
  const session = await auth()
  const userId = session?.user?.id
  const accessToken = session?.accessToken as string | undefined

  if (!userId || !accessToken) {
    throw new SocialConnectError('unauthorized', 'Unauthorized', 401)
  }

  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    throw new SocialConnectError('no_workspace', 'No workspace selected', 400)
  }

  const workspaceId = workspace.id || workspace._id
  if (!workspaceId) {
    throw new SocialConnectError('no_workspace', 'No workspace selected', 400)
  }

  return { userId, accessToken, workspace, workspaceId }
}

export function assertWorkspaceMatches(
  sessionWorkspaceId: string,
  expectedWorkspaceId: string,
): void {
  if (sessionWorkspaceId !== expectedWorkspaceId) {
    throw new SocialConnectError(
      'invalid_state',
      'Workspace changed during OAuth flow',
      400,
    )
  }
}
