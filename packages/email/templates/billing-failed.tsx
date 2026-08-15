import { EmailEmphasis, EmailLayout, EmailParagraph } from './email-layout.js'
import type { BillingEmailProps } from './billing-success.js'

export function BillingFailedEmail({
  name,
  workspaceName,
  planLabel,
  manageUrl,
}: BillingEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview={`We couldn’t renew ${planLabel} for ${workspaceName}.`}
      heading="Payment didn’t go through."
      cta={{ label: 'Update payment', href: manageUrl }}
      footerNote="You received this because you’re an owner or admin of this workspace."
    >
      <EmailParagraph>
        Hi {firstName}, we couldn’t process the latest payment for{' '}
        <EmailEmphasis>{workspaceName}</EmailEmphasis> on the{' '}
        <EmailEmphasis>{planLabel}</EmailEmphasis> plan.
      </EmailParagraph>
      <EmailParagraph>
        Update your payment method to keep your workspace on this plan.
      </EmailParagraph>
    </EmailLayout>
  )
}

export default function BillingFailedEmailPreview() {
  return (
    <BillingFailedEmail
      name="Alex"
      workspaceName="Northstar Studio"
      planLabel="Pro"
      manageUrl="https://socialista.app/dashboard/settings/billing"
    />
  )
}
