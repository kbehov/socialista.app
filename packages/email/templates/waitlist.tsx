import { EmailLayout, EmailParagraph } from './email-layout.js'

export function WaitlistEmail() {
  return (
    <EmailLayout
      preview="You’re on the Socialista waitlist."
      heading="You’re on the list."
      footerNote="We’ll email you when it’s your turn. You can ignore this if you didn’t join the waitlist."
    >
      <EmailParagraph>
        Thanks for joining the Socialista waitlist. We’ll let you know as soon as a spot opens.
      </EmailParagraph>
      <EmailParagraph>No action needed for now.</EmailParagraph>
    </EmailLayout>
  )
}

export default function WaitlistEmailPreview() {
  return <WaitlistEmail />
}
