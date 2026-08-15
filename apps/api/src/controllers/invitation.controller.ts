import {
  getQueryString,
  parseParamId,
  type AuthContext,
} from '@/utils/common.utils.js'
import {
  getInvitationForRecipient,
  getInvitationOrThrow,
  loadInvitationWorkspace,
  parseCreateInvitationInput,
  parseInvitationToken,
  parseInvitationTokenQuery,
  parseWorkspaceQueryId,
  serializeInvitation,
  serializeInvitationWorkspace,
} from '@/utils/invitation.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  assertMemberLimit,
  getWorkspaceAsAdmin,
  getWorkspaceOrThrow,
} from '@/utils/workspace.utils.js'
import {
  acceptInvitation as acceptInvitationRecord,
  addWorkspaceMember,
  createInvitation as createInvitationRecord,
  deleteInvitation as deleteInvitationRecord,
  getInvitations as getInvitationsFromDb,
  getPendingInvitationByWorkspaceAndEmail,
  getUserByEmail,
  rejectInvitation as rejectInvitationRecord,
} from '@socialista/db'

export const createInvitation = async (c: AuthContext) => {
  const userId = c.get('userId')
  const input = parseCreateInvitationInput(await c.req.json())
  const workspace = await getWorkspaceAsAdmin(input.workspaceId, userId)

  assertMemberLimit(workspace)

  const existingUser = await getUserByEmail(input.email)
  if (
    existingUser &&
    workspace.members.some(member => member.userId.toString() === existingUser._id.toString())
  ) {
    throw new HttpError(409, 'This person is already a member of the workspace')
  }

  const pending = await getPendingInvitationByWorkspaceAndEmail(input.workspaceId, input.email)
  if (pending) {
    throw new HttpError(409, 'A pending invitation already exists for this email')
  }

  const invitation = await createInvitationRecord({
    workspace: input.workspaceId,
    email: input.email,
    invitedBy: userId,
    role: input.role,
  })

  return successResponse(c, 201, {
    invitation: serializeInvitation(invitation, true),
  })
}

export const getInvitations = async (c: AuthContext) => {
  const userId = c.get('userId')
  const query = getQueryString(c.req.url)
  await getWorkspaceAsAdmin(parseWorkspaceQueryId(query), userId)

  const { invitations, meta } = await getInvitationsFromDb(query)
  return successResponse(
    c,
    200,
    { invitations: invitations.map(invitation => serializeInvitation(invitation, true)) },
    meta,
  )
}

export const previewInvitation = async (c: AuthContext) => {
  const token = parseInvitationTokenQuery(getQueryString(c.req.url))
  const invitation = await getInvitationForRecipient(token, c.get('userId'))
  const workspace = await loadInvitationWorkspace(invitation.workspace.toString())

  return successResponse(c, 200, {
    invitation: serializeInvitation(invitation),
    workspace: serializeInvitationWorkspace(workspace),
    expired: invitation.invitationExpiresAt < new Date(),
  })
}

export const getInvitation = async (c: AuthContext) => {
  const invitation = await getInvitationOrThrow(parseParamId(c.req.param('id'), 'invitation ID'))
  await getWorkspaceAsAdmin(invitation.workspace.toString(), c.get('userId'))

  return successResponse(c, 200, { invitation: serializeInvitation(invitation) })
}

export const deleteInvitation = async (c: AuthContext) => {
  const id = parseParamId(c.req.param('id'), 'invitation ID')
  const invitation = await getInvitationOrThrow(id)

  await getWorkspaceAsAdmin(invitation.workspace.toString(), c.get('userId'))
  await deleteInvitationRecord(id)

  return successResponse(c, 200, { message: 'Invitation deleted successfully' })
}

export const acceptInvitation = async (c: AuthContext) => {
  const userId = c.get('userId')
  const token = parseInvitationToken(await c.req.json())
  const invitation = await getInvitationForRecipient(token, userId)
  const workspace = await getWorkspaceOrThrow(invitation.workspace.toString())

  const alreadyMember = workspace.members.some(member => member.userId.toString() === userId)
  if (!alreadyMember) {
    assertMemberLimit(workspace)
    await addWorkspaceMember(invitation.workspace.toString(), userId, invitation.role)
  }

  const updated = await acceptInvitationRecord(token)

  return successResponse(c, 200, {
    invitation: serializeInvitation(updated!),
    workspace: serializeInvitationWorkspace(workspace),
  })
}

export const rejectInvitation = async (c: AuthContext) => {
  const userId = c.get('userId')
  const token = parseInvitationToken(await c.req.json())
  await getInvitationForRecipient(token, userId)

  const updated = await rejectInvitationRecord(token)
  return successResponse(c, 200, { invitation: serializeInvitation(updated!) })
}
