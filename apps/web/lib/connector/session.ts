import { auth } from '@/auth'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { WorkspaceResponse } from '@socialista/types'
type ConnectionSession = {
  userId: string
  accessToken: string
  workspaceId: string
  workspace: WorkspaceResponse
}
export async function requireAuthSession(): Promise<ConnectionSession> {
  const session = await auth()
  const userId = session?.user?.id
  const accessToken = session?.accessToken as string | undefined

  if (!userId || !accessToken) {
    throw new Error('Unauthorized. Please login to continue.')
  }

  const workspace = await getCurrentWorkspace()
  if (!workspace) {
    throw new Error('No workspace selected')
  }

  const workspaceId = workspace.id || workspace._id
  if (!workspaceId) {
    throw new Error('No workspace selected')
  }

  return { userId, accessToken, workspace, workspaceId }
}
