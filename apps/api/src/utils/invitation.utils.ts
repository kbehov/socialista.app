import { parseParamId } from '@/utils/common.utils.js'
import { HttpError } from '@/utils/http-response.js'
import { getUserOrThrow } from '@/utils/user.utils.js'
import { isValidWorkspaceMemberRole } from '@/utils/workspace.utils.js'
import {
  getInvitationById,
  getInvitationByToken,
  isValidEmail,
  WorkspaceMemberRole,
  type Invitation,
} from '@socialista/db'

export const serializeInvitation = (invitation: Invitation, includeToken = false) => ({
  id: invitation._id.toString(),
  workspaceId: invitation.workspace.toString(),
  email: invitation.email,
  role: invitation.role,
  status: invitation.status,
  invitedBy: invitation.invitedBy.toString(),
  invitationExpiresAt: invitation.invitationExpiresAt,
  createdAt: invitation.createdAt,
  updatedAt: invitation.updatedAt,
  ...(includeToken && { token: invitation.invitationToken }),
})

export const getInvitationOrThrow = async (id: string) => {
  const invitation = await getInvitationById(id)
  if (!invitation) {
    throw new HttpError(404, 'Invitation not found')
  }
  return invitation
}

export const getInvitationByTokenOrThrow = async (token: string) => {
  const invitation = await getInvitationByToken(token)
  if (!invitation) {
    throw new HttpError(404, 'Invitation not found')
  }
  return invitation
}

export const parseWorkspaceQueryId = (query: string): string => {
  const workspaceId = new URLSearchParams(query).get('workspace')
  return parseParamId(workspaceId ?? undefined, 'workspace ID')
}

export const parseInvitationToken = (body: Record<string, unknown>): string => {
  if (typeof body.token !== 'string' || !body.token.trim()) {
    throw new HttpError(400, 'Token is required')
  }
  return body.token.trim()
}

export const parseCreateInvitationInput = (body: Record<string, unknown>) => {
  const workspaceId = parseParamId(
    typeof body.workspace === 'string' ? body.workspace : undefined,
    'workspace ID',
  )

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (!email || !isValidEmail(email)) {
    throw new HttpError(400, 'Valid email is required')
  }

  if (!isValidWorkspaceMemberRole(body.role)) {
    throw new HttpError(400, 'Valid role is required')
  }
  if (body.role === WorkspaceMemberRole.OWNER) {
    throw new HttpError(400, 'Cannot invite a workspace owner')
  }

  return { workspaceId, email, role: body.role }
}

export const assertInvitationRecipient = (invitation: Invitation, email: string): void => {
  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    throw new HttpError(403, 'This invitation is for a different email')
  }
}

export const getInvitationForRecipient = async (token: string, userId: string) => {
  const [invitation, user] = await Promise.all([
    getInvitationByTokenOrThrow(token),
    getUserOrThrow(userId),
  ])
  assertInvitationRecipient(invitation, user.email)
  return invitation
}
