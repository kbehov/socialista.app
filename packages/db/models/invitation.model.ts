import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { type Invitation, InvitationStatus } from '../types/invitation.types.js'
import { WorkspaceMemberRole } from '../types/workspace.types.js'

const invitationSchema = new Schema<Invitation>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    email: { type: String, required: true },
    invitationToken: { type: String, required: true },
    invitationExpiresAt: { type: Date, required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: enumValues(WorkspaceMemberRole), required: true },
    status: { type: String, enum: enumValues(InvitationStatus), required: true },
  },
  { timestamps: true },
)

invitationSchema.index({ workspace: 1, email: 1, invitationToken: 1 }, { unique: true })

invitationSchema.pre('validate', function () {
  if (!this.invitationToken) {
    this.invitationToken = crypto.randomUUID()
    this.status = InvitationStatus.PENDING
    this.invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
  }
})

export const InvitationModel = model<Invitation>('Invitation', invitationSchema)
