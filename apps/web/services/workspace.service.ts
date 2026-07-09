'use server'

import { WORKSPACE_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  AddWorkspaceMemberPayload,
  ApiResponse,
  CreateWorkspacePayload,
  UpdateWorkspaceMemberPayload,
  UpdateWorkspacePayload,
  WorkspaceBalanceResponse,
  WorkspaceBillingResponse,
  WorkspaceMemberResponse,
  WorkspaceResponse,
  WorkspaceUsageSummary,
} from '@socialista/types'
import { revalidateTag } from 'next/cache'

function workspaceTags(workspaceId?: string) {
  const tags = ['workspaces']
  if (workspaceId) {
    tags.push(`workspace-${workspaceId}`, `workspace-billing-${workspaceId}`)
  }
  return tags
}

function revalidateWorkspaces(workspaceId?: string) {
  for (const tag of workspaceTags(workspaceId)) {
    revalidateTag(tag, 'max')
  }
}

export const getUserWorkspaces = async (): Promise<ApiResponse<WorkspaceResponse[]>> => {
  return api.get<WorkspaceResponse[]>(WORKSPACE_ROUTES.GET_WORKSPACES, {
    next: {
      revalidate: 60,
      tags: ['workspaces'],
    },
  })
}

export const getWorkspace = async (workspaceId: string): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  return api.get<{ workspace: WorkspaceResponse }>(WORKSPACE_ROUTES.GET_WORKSPACE(workspaceId), {
    next: {
      revalidate: 60,
      tags: [`workspace-${workspaceId}`],
    },
  })
}

export const getWorkspaceBilling = async (workspaceId: string): Promise<ApiResponse<WorkspaceBillingResponse>> => {
  return api.get<WorkspaceBillingResponse>(WORKSPACE_ROUTES.GET_WORKSPACE_BILLING(workspaceId), {
    next: {
      revalidate: 30,
      tags: [`workspace-billing-${workspaceId}`],
    },
  })
}

export const getWorkspaceUsage = async (
  workspaceId: string,
): Promise<ApiResponse<{ usage: WorkspaceUsageSummary }>> => {
  return api.get<{ usage: WorkspaceUsageSummary }>(WORKSPACE_ROUTES.GET_WORKSPACE_USAGE(workspaceId), {
    next: {
      revalidate: 30,
      tags: [`workspace-${workspaceId}`],
    },
  })
}

export const getWorkspaceBalance = async (workspaceId: string): Promise<ApiResponse<WorkspaceBalanceResponse>> => {
  return api.get<WorkspaceBalanceResponse>(WORKSPACE_ROUTES.GET_WORKSPACE_BALANCE(workspaceId), {
    next: {
      revalidate: 30,
      tags: [`workspace-billing-${workspaceId}`],
    },
  })
}

export const createWorkspace = async (
  payload: CreateWorkspacePayload,
): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  const response = await api.post<{ workspace: WorkspaceResponse }>(WORKSPACE_ROUTES.CREATE_WORKSPACE, payload)
  revalidateWorkspaces(response.data?.workspace.id)
  return response
}

export const updateWorkspace = async (
  workspaceId: string,
  payload: UpdateWorkspacePayload,
): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  const response = await api.patch<{ workspace: WorkspaceResponse }>(
    WORKSPACE_ROUTES.UPDATE_WORKSPACE(workspaceId),
    payload,
  )
  revalidateWorkspaces(workspaceId)
  return response
}

export const deleteWorkspace = async (workspaceId: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(WORKSPACE_ROUTES.DELETE_WORKSPACE(workspaceId))
  revalidateWorkspaces(workspaceId)
  return response
}

export const getWorkspaceMembers = async (
  workspaceId: string,
): Promise<ApiResponse<{ members: WorkspaceMemberResponse[] }>> => {
  return api.get<{ members: WorkspaceMemberResponse[] }>(WORKSPACE_ROUTES.GET_MEMBERS(workspaceId), {
    next: {
      revalidate: 60,
      tags: [`workspace-${workspaceId}`],
    },
  })
}

export const addWorkspaceMember = async (
  workspaceId: string,
  payload: AddWorkspaceMemberPayload,
): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  const response = await api.post<{ workspace: WorkspaceResponse }>(WORKSPACE_ROUTES.ADD_MEMBER(workspaceId), payload)
  revalidateWorkspaces(workspaceId)
  return response
}

export const updateWorkspaceMember = async (
  workspaceId: string,
  memberId: string,
  payload: UpdateWorkspaceMemberPayload,
): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  const response = await api.patch<{ workspace: WorkspaceResponse }>(
    WORKSPACE_ROUTES.UPDATE_MEMBER(workspaceId, memberId),
    payload,
  )
  revalidateWorkspaces(workspaceId)
  return response
}

export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string,
): Promise<ApiResponse<{ workspace: WorkspaceResponse }>> => {
  const response = await api.delete<{ workspace: WorkspaceResponse }>(
    WORKSPACE_ROUTES.REMOVE_MEMBER(workspaceId, memberId),
  )
  revalidateWorkspaces(workspaceId)
  return response
}

export const getWorkspaceBillingStatus = async (
  workspaceId: string,
): Promise<ApiResponse<WorkspaceResponse['billing']>> => {
  return api.get<WorkspaceResponse['billing']>(WORKSPACE_ROUTES.GET_WORKSPACE_BILLING_STATUS(workspaceId), {
    next: {
      revalidate: 30,
      tags: [`workspace-billing-${workspaceId}`],
    },
  })
}
