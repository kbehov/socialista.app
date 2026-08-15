import { EmailEmphasis, EmailLayout, EmailParagraph } from './email-layout.js'

export type InvitationEmailProps = {
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
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

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function InvitationEmail({
  inviterName,
  workspaceName,
  role,
  inviteUrl,
  expiresAt,
}: InvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to ${workspaceName}.`}
      heading="You’re invited."
      cta={{ label: 'Join workspace', href: inviteUrl }}
      footerNote="This invitation expires in 24 hours. If you weren’t expecting it, you can ignore this email."
    >
      <EmailParagraph>
        <EmailEmphasis>{inviterName}</EmailEmphasis> invited you to join{' '}
        <EmailEmphasis>{workspaceName}</EmailEmphasis> as {formatRole(role).toLowerCase()}.
      </EmailParagraph>
      <EmailParagraph>
        Accept before {formatExpiry(expiresAt)} to start collaborating.
      </EmailParagraph>
    </EmailLayout>
  )
}

const PREVIEW_EXPIRES_AT = new Date('2026-08-16T12:00:00.000Z')

export default function InvitationEmailPreview() {
  return (
    <InvitationEmail
      inviterName="Jordan Lee"
      workspaceName="Northstar Studio"
      role="member"
      inviteUrl="https://socialista.app/invite/preview"
      expiresAt={PREVIEW_EXPIRES_AT}
    />
  )
}
