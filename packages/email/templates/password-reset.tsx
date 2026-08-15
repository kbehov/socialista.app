import { EmailLayout, EmailParagraph } from './email-layout.js'

export type PasswordResetEmailProps = {
  name: string
  resetUrl: string
  expiresAt: Date
}

function formatExpiry(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function PasswordResetEmail({ name, resetUrl, expiresAt }: PasswordResetEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview="Reset your Socialista password."
      heading="Reset your password."
      cta={{ label: 'Choose a new password', href: resetUrl }}
      footerNote="If you didn’t ask to reset your password, you can ignore this email."
    >
      <EmailParagraph>Hi {firstName}, we received a request to reset your password.</EmailParagraph>
      <EmailParagraph>
        This link expires at {formatExpiry(expiresAt)}. After that, you’ll need to request a new
        one.
      </EmailParagraph>
    </EmailLayout>
  )
}

const PREVIEW_EXPIRES_AT = new Date('2026-08-15T13:00:00.000Z')

export default function PasswordResetEmailPreview() {
  return (
    <PasswordResetEmail
      name="Alex"
      resetUrl="https://socialista.app/auth/reset-password?token=preview"
      expiresAt={PREVIEW_EXPIRES_AT}
    />
  )
}
