'use server'

import { INVITATION_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  AcceptInvitationResponse,
  ApiResponse,
  CreateInvitationPayload,
  InvitationPreviewResponse,
  InvitationResponse,
  InvitationStatus,
  InvitationTokenPayload,
} from '@socialista/types'
import { revalidateTag } from 'next/cache'

function invitationTags(workspaceId?: string) {
  const tags = ['invitations']
  if (workspaceId) {
    tags.push(`workspace-${workspaceId}`, `invitations-${workspaceId}`)
  }
  return tags
}

function revalidateInvitations(workspaceId?: string) {
  for (const tag of invitationTags(workspaceId)) {
    revalidateTag(tag, 'max')
  }
}

async function withInvitationError<T>(request: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
  try {
    return await request()
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

export const getWorkspaceInvitations = async (
  workspaceId: string,
  query?: { status?: InvitationStatus },
): Promise<ApiResponse<{ invitations: InvitationResponse[] }>> => {
  const params = new URLSearchParams({ workspace: workspaceId })
  if (query?.status) params.set('status', query.status)

  return withInvitationError(() =>
    api.get<{ invitations: InvitationResponse[] }>(`${INVITATION_ROUTES.LIST}?${params.toString()}`, {
      next: {
        revalidate: 60,
        tags: invitationTags(workspaceId),
      },
    }),
  )
}

export const createInvitation = async (
  payload: CreateInvitationPayload,
): Promise<ApiResponse<{ invitation: InvitationResponse }>> => {
  const response = await withInvitationError(() =>
    api.post<{ invitation: InvitationResponse }>(INVITATION_ROUTES.CREATE, payload),
  )
  if (response.success) revalidateInvitations(payload.workspace)
  return response
}

export const deleteInvitation = async (
  invitationId: string,
  workspaceId: string,
): Promise<ApiResponse<{ message: string }>> => {
  const response = await withInvitationError(() =>
    api.delete<{ message: string }>(INVITATION_ROUTES.DELETE(invitationId)),
  )
  if (response.success) revalidateInvitations(workspaceId)
  return response
}

export const previewInvitation = async (token: string): Promise<ApiResponse<InvitationPreviewResponse>> => {
  const params = new URLSearchParams({ token })
  return withInvitationError(() =>
    api.get<InvitationPreviewResponse>(`${INVITATION_ROUTES.PREVIEW}?${params.toString()}`),
  )
}

export const acceptInvitation = async (
  payload: InvitationTokenPayload,
): Promise<ApiResponse<AcceptInvitationResponse>> => {
  const response = await withInvitationError(() =>
    api.post<AcceptInvitationResponse>(INVITATION_ROUTES.ACCEPT, payload),
  )
  if (response.success) revalidateInvitations(response.data?.workspace.id)
  return response
}

export const rejectInvitation = async (
  payload: InvitationTokenPayload,
): Promise<ApiResponse<{ invitation: InvitationResponse }>> => {
  return withInvitationError(() => api.post<{ invitation: InvitationResponse }>(INVITATION_ROUTES.REJECT, payload))
}
