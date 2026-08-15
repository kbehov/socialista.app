import { PasswordResetEmail } from '../templates/password-reset.js'
import { sendEmail } from './send.js'

export type SendPasswordResetEmailInput = {
  to: string
  name: string
  resetUrl: string
  expiresAt: Date
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresAt,
}: SendPasswordResetEmailInput) {
  await sendEmail({
    to,
    subject: 'Reset your Socialista password',
    react: PasswordResetEmail({ name, resetUrl, expiresAt }),
  })
}
