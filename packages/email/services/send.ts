import type { ReactNode } from 'react'
import { getEmailFrom } from '../lib/env.js'
import { getResend } from '../lib/resend.js'

export type SendEmailInput = {
  to: string
  subject: string
  react: ReactNode
}

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const resend = getResend()
  const from = getEmailFrom()

  if (!resend || !from) {
    console.warn('[email] RESEND_API_KEY or EMAIL_FROM is not set; skipping send')
    return
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
  })

  if (error) {
    throw new Error(error.message)
  }
}
