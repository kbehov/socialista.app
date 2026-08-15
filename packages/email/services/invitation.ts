import { InvitationEmail } from '../templates/invitation.js'
import { sendEmail } from './send.js'

export type SendInvitationEmailInput = {
  to: string
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
  expiresAt: Date
}

export async function sendInvitationEmail({
  to,
  inviterName,
  workspaceName,
  role,
  inviteUrl,
  expiresAt,
}: SendInvitationEmailInput) {
  await sendEmail({
    to,
    subject: `${inviterName} invited you to ${workspaceName}`,
    react: InvitationEmail({
      inviterName,
      workspaceName,
      role,
      inviteUrl,
      expiresAt,
    }),
  })
}
