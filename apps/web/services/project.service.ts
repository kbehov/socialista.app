'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { PROJECT_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateProjectPayload,
  ProjectResponse,
  UpdateProjectPayload,
} from '@socialista/types'
import { revalidatePath, revalidateTag } from 'next/cache'

function projectTags(workspaceId?: string) {
  const tags = ['projects']
  if (workspaceId) {
    tags.push(`workspace-projects-${workspaceId}`)
  }
  return tags
}

function revalidateProjects(workspaceId?: string) {
  for (const tag of projectTags(workspaceId)) {
    revalidateTag(tag, 'max')
  }
  revalidatePath(DASHBOARD_ROUTES.ROOT)
}

export const getWorkspaceProjects = async (
  workspaceId: string,
): Promise<ApiResponse<{ projects: ProjectResponse[] }>> => {
  return api.get<{ projects: ProjectResponse[] }>(PROJECT_ROUTES.GET_WORKSPACE_PROJECTS(workspaceId), {
    next: {
      revalidate: 300,
      tags: projectTags(workspaceId),
    },
  })
}

export const createProject = async (
  payload: CreateProjectPayload,
): Promise<ApiResponse<{ project: ProjectResponse }>> => {
  const response = await api.post<{ project: ProjectResponse }>(PROJECT_ROUTES.CREATE, payload)
  revalidateProjects(payload.workspaceId)
  return response
}

export const updateProject = async (
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<ApiResponse<{ project: ProjectResponse }>> => {
  const response = await api.patch<{ project: ProjectResponse }>(PROJECT_ROUTES.UPDATE(projectId), payload)
  revalidateProjects(response.data?.project.workspaceId)
  return response
}

export const deleteProject = async (projectId: string): Promise<ApiResponse<{ id: string; workspaceId: string }>> => {
  const response = await api.delete<{ id: string; workspaceId: string }>(PROJECT_ROUTES.DELETE(projectId))
  revalidateProjects(response.data?.workspaceId)
  return response
}
