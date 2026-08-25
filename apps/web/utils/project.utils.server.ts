import { cache } from 'react'

import { getWorkspaceProjects } from '@/services/project.service'
import { getCurrentProjectId } from '@/utils/cookie.utils.server'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { ProjectResponse, WorkspaceResponse } from '@socialista/types'

export const getCachedWorkspaceProjects = cache(async (workspaceId: string): Promise<ProjectResponse[]> => {
  const response = await getWorkspaceProjects(workspaceId)
  return response.data?.projects ?? []
})

export function findProjectById(
  projects: ProjectResponse[],
  projectId: string | undefined,
): ProjectResponse | undefined {
  if (!projectId || projectId === 'undefined' || projectId === 'null') return undefined
  return projects.find(project => project.id === projectId || project._id === projectId)
}

/** Resolves the active project from `socialista_cpj`, falling back to the default or first project. */
export const getCurrentProject = cache(async (workspaceId: string): Promise<ProjectResponse | null> => {
  const [projects, cookieId] = await Promise.all([
    getCachedWorkspaceProjects(workspaceId),
    getCurrentProjectId(),
  ])
  return (
    findProjectById(projects, cookieId) ??
    projects.find(project => project.isDefault) ??
    projects[0] ??
    null
  )
})

export const getCurrentWorkspaceContext = cache(
  async (): Promise<{ workspace: WorkspaceResponse | null; project: ProjectResponse | null }> => {
    const workspace = await getCurrentWorkspace()
    if (!workspace) return { workspace: null, project: null }
    const project = await getCurrentProject(workspace.id)
    return { workspace, project }
  },
)
