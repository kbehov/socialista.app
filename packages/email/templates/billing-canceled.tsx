import { EmailEmphasis, EmailLayout, EmailParagraph } from './email-layout.js'
import type { BillingEmailProps } from './billing-success.js'

export function BillingCanceledEmail({
  name,
  workspaceName,
  planLabel,
  manageUrl,
}: BillingEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview={`${planLabel} has been canceled for ${workspaceName}.`}
      heading="Subscription canceled."
      cta={{ label: 'Review billing', href: manageUrl }}
      footerNote="You received this because you’re an owner or admin of this workspace."
    >
      <EmailParagraph>
        Hi {firstName}, the <EmailEmphasis>{planLabel}</EmailEmphasis> subscription for{' '}
        <EmailEmphasis>{workspaceName}</EmailEmphasis> has been canceled.
      </EmailParagraph>
      <EmailParagraph>You can resubscribe anytime from billing settings.</EmailParagraph>
    </EmailLayout>
  )
}

export default function BillingCanceledEmailPreview() {
  return (
    <BillingCanceledEmail
      name="Alex"
      workspaceName="Northstar Studio"
      planLabel="Pro"
      manageUrl="https://socialista.app/dashboard/settings/billing"
    />
  )
}
