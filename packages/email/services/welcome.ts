import { getAppUrl } from '../lib/env.js'
import { WelcomeEmail } from '../templates/welcome.js'
import { sendEmail } from './send.js'

export type SendWelcomeEmailInput = {
  to: string
  name: string
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailInput) {
  await sendEmail({
    to,
    subject: 'Welcome to Socialista',
    react: WelcomeEmail({
      name,
      dashboardUrl: `${getAppUrl()}/dashboard`,
    }),
  })
}
