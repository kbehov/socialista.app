import { WaitlistEmail } from '../templates/waitlist.js'
import { sendEmail } from './send.js'

export type SendWaitlistEmailInput = {
  to: string
}

export async function sendWaitlistEmail({ to }: SendWaitlistEmailInput) {
  await sendEmail({
    to,
    subject: 'You’re on the Socialista waitlist',
    react: WaitlistEmail(),
  })
}
