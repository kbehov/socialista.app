import { EmailEmphasis, EmailLayout, EmailParagraph } from './email-layout.js'
import type { BillingEmailProps } from './billing-success.js'

export function BillingRenewedEmail({
  name,
  workspaceName,
  planLabel,
  manageUrl,
}: BillingEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview={`${planLabel} renewed for ${workspaceName}.`}
      heading="Your plan renewed."
      cta={{ label: 'View billing', href: manageUrl }}
      footerNote="You received this because you’re an owner or admin of this workspace."
    >
      <EmailParagraph>
        Hi {firstName}, <EmailEmphasis>{workspaceName}</EmailEmphasis> has renewed on the{' '}
        <EmailEmphasis>{planLabel}</EmailEmphasis> plan.
      </EmailParagraph>
      <EmailParagraph>Usage for the new billing period has been reset.</EmailParagraph>
    </EmailLayout>
  )
}

export default function BillingRenewedEmailPreview() {
  return (
    <BillingRenewedEmail
      name="Alex"
      workspaceName="Northstar Studio"
      planLabel="Pro"
      manageUrl="https://socialista.app/dashboard/settings/billing"
    />
  )
}
