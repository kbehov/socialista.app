import { EmailEmphasis, EmailLayout, EmailParagraph } from './email-layout.js'

export type BillingEmailProps = {
  name: string
  workspaceName: string
  planLabel: string
  manageUrl: string
}

export function BillingSuccessEmail({
  name,
  workspaceName,
  planLabel,
  manageUrl,
}: BillingEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview={`${planLabel} is now active on ${workspaceName}.`}
      heading="You’re all set."
      cta={{ label: 'Manage billing', href: manageUrl }}
      footerNote="You received this because you’re an owner or admin of this workspace."
    >
      <EmailParagraph>
        Hi {firstName}, the <EmailEmphasis>{planLabel}</EmailEmphasis> plan is now active for{' '}
        <EmailEmphasis>{workspaceName}</EmailEmphasis>.
      </EmailParagraph>
      <EmailParagraph>Your workspace limits and credits have been updated.</EmailParagraph>
    </EmailLayout>
  )
}

export default function BillingSuccessEmailPreview() {
  return (
    <BillingSuccessEmail
      name="Alex"
      workspaceName="Northstar Studio"
      planLabel="Pro"
      manageUrl="https://socialista.app/dashboard/settings/billing"
    />
  )
}
