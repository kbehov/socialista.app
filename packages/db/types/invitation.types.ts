import { HydratedDocument, Types } from 'mongoose'
import { WorkspaceMemberRole } from './workspace.types.js'
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}
export type Invitation = {
  _id: string
  workspace: Types.ObjectId
  email: string
  invitationToken: string
  invitationExpiresAt: Date
  invitedBy: Types.ObjectId
  role: WorkspaceMemberRole
  status: InvitationStatus
  createdAt: Date
  updatedAt: Date
}

export type InvitationDocument = HydratedDocument<Invitation>
