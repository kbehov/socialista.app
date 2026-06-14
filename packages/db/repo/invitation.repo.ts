import { Types } from 'mongoose'
import { InvitationModel } from '../models/invitation.model.js'
import { InvitationStatus } from '../types/invitation.types.js'
import { WorkspaceMemberRole } from '../types/workspace.types.js'
import { buildFilters } from '../utils/build-filters.js'

export type CreateInvitationInput = {
  workspace: string
  email: string
  invitedBy: string
  role: WorkspaceMemberRole
}

export const getInvitationById = async (id: string) => {
  return await InvitationModel.findById(id).lean()
}

export const getInvitationByToken = async (token: string) => {
  return await InvitationModel.findOne({ invitationToken: token }).lean()
}

export const getPendingInvitationByWorkspaceAndEmail = async (workspaceId: string, email: string) => {
  return await InvitationModel.findOne({
    workspace: new Types.ObjectId(workspaceId),
    email,
    status: InvitationStatus.PENDING,
  }).lean()
}

export const createInvitation = async (input: CreateInvitationInput) => {
  const { workspace, email, invitedBy, role } = input
  if (!workspace || !email || !invitedBy || !role) {
    throw new Error('Workspace, email, invitedBy and role are required')
  }

  const existing = await getPendingInvitationByWorkspaceAndEmail(workspace, email)
  if (existing) {
    throw new Error('A pending invitation already exists for this email')
  }

  return await InvitationModel.create({
    workspace: new Types.ObjectId(workspace),
    email,
    invitedBy: new Types.ObjectId(invitedBy),
    role,
  })
}

export const updateInvitationStatus = async (id: string, status: InvitationStatus) => {
  return await InvitationModel.findByIdAndUpdate(id, { status }, { new: true }).lean()
}

const assertPendingInvitation = (invitation: Awaited<ReturnType<typeof getInvitationByToken>>) => {
  if (!invitation) {
    throw new Error('Invitation not found')
  }
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new Error('Invitation is no longer pending')
  }
  if (invitation.invitationExpiresAt < new Date()) {
    throw new Error('Invitation has expired')
  }
  return invitation
}

export const acceptInvitation = async (token: string) => {
  const invitation = assertPendingInvitation(await getInvitationByToken(token))
  return await updateInvitationStatus(invitation._id.toString(), InvitationStatus.ACCEPTED)
}

export const rejectInvitation = async (token: string) => {
  const invitation = assertPendingInvitation(await getInvitationByToken(token))
  return await updateInvitationStatus(invitation._id.toString(), InvitationStatus.REJECTED)
}

export const deleteInvitation = async (id: string) => {
  return await InvitationModel.findByIdAndDelete(id).lean()
}

export const getInvitations = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const invitations = await InvitationModel.find(match)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort)
    .lean()
  const total = await InvitationModel.countDocuments(match)
  return {
    invitations,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
  }
}
