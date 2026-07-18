import { cache } from 'react'

import { getUserWorkspaces } from '@/services/workspace.service'
import { getCurrentWorkspaceId } from '@/utils/cookie.utils.server'
import type { WorkspaceResponse } from '@socialista/types'

export const getCachedUserWorkspaces = cache(async (): Promise<WorkspaceResponse[]> => {
  const response = await getUserWorkspaces()
  return response.data ?? []
})

export function findWorkspaceById(
  workspaces: WorkspaceResponse[],
  workspaceId: string | undefined,
): WorkspaceResponse | undefined {
  if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') return undefined
  return workspaces.find(workspace => workspace.id === workspaceId || workspace._id === workspaceId)
}

/** Resolves the active workspace from `socialista_cwp`, falling back to the first workspace. */
export const getCurrentWorkspace = cache(async (): Promise<WorkspaceResponse | null> => {
  const [workspaces, cookieId] = await Promise.all([getCachedUserWorkspaces(), getCurrentWorkspaceId()])
  return findWorkspaceById(workspaces, cookieId) ?? workspaces[0] ?? null
})
