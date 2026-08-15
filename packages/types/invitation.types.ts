export type InvitationRole = 'admin' | 'member'

export type InvitationStatus = 'pending' | 'accepted' | 'rejected'

export type InvitationResponse = {
  id: string
  workspaceId: string
  email: string
  role: InvitationRole
  status: InvitationStatus
  invitedBy: string
  invitationExpiresAt: Date
  createdAt: Date
  updatedAt: Date
  token?: string
}

export type InvitationWorkspacePreview = {
  id: string
  name: string
  logo?: string
}

export type InvitationPreviewResponse = {
  invitation: InvitationResponse
  workspace: InvitationWorkspacePreview
  expired: boolean
}

export type AcceptInvitationResponse = {
  invitation: InvitationResponse
  workspace: InvitationWorkspacePreview
}

export type CreateInvitationPayload = {
  workspace: string
  email: string
  role: InvitationRole
}

export type InvitationTokenPayload = {
  token: string
}
