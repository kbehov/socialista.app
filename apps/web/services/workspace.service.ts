'use server'
import { WORKSPACE_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type { ApiResponse, WorkspaceResponse } from '@socialista/types'

export const getUserWorkspaces = async (): Promise<ApiResponse<WorkspaceResponse[]>> => {
  const response = await api.get<WorkspaceResponse[]>(WORKSPACE_ROUTES.GET_WORKSPACES, {
    next: {
      revalidate: 60,
      tags: ['workspaces'],
    },
  })
  return response
}
