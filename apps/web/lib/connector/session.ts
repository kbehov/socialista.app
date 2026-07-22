import { auth } from '@/auth'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { WorkspaceResponse } from '@socialista/types'

import { ConnectorError } from './errors'

export type ConnectSession = {
  userId: string
  accessToken: string
  workspaceId: string
  workspace: WorkspaceResponse
}

/** Authenticated user + active workspace for OAuth connect routes. */
export async function requireConnectSession(): Promise<ConnectSession> {
  const session = await auth()
  const userId = session?.user?.id
  const accessToken = session?.accessToken as string | undefined

  if (!userId || !accessToken) {
    throw new ConnectorError('unauthorized', 'Unauthorized. Please login to continue.', 401)
  }

  const workspace = await getCurrentWorkspace()
  const workspaceId = workspace?.id || workspace?._id
  if (!workspace || !workspaceId) {
    throw new ConnectorError('no_workspace', 'No workspace selected', 400)
  }

  return { userId, accessToken, workspace, workspaceId }
}
