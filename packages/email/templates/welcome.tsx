import { EmailLayout, EmailParagraph } from './email-layout.js'

export type WelcomeEmailProps = {
  name: string
  dashboardUrl: string
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailLayout
      preview="Your workspace is ready."
      heading={`Welcome, ${firstName}.`}
      cta={{ label: 'Open Socialista', href: dashboardUrl }}
      footerNote="You received this because you created a Socialista account."
    >
      <EmailParagraph>
        Your workspace is ready. Create, schedule, and publish social content from one calm place.
      </EmailParagraph>
      <EmailParagraph>
        Start with a post, generate an image, or invite your team when you’re ready.
      </EmailParagraph>
    </EmailLayout>
  )
}

export default function WelcomeEmailPreview() {
  return <WelcomeEmail name="Alex" dashboardUrl="https://socialista.app/dashboard" />
}
