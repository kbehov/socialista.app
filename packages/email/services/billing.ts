import { BillingCanceledEmail } from '../templates/billing-canceled.js'
import { BillingFailedEmail } from '../templates/billing-failed.js'
import { BillingRenewedEmail } from '../templates/billing-renewed.js'
import { BillingSuccessEmail } from '../templates/billing-success.js'
import { sendEmail } from './send.js'

export type SendBillingEmailInput = {
  to: string
  name: string
  workspaceName: string
  planLabel: string
  manageUrl: string
}

export async function sendBillingSuccessEmail(input: SendBillingEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `${input.planLabel} is now active`,
    react: BillingSuccessEmail(input),
  })
}

export async function sendBillingRenewedEmail(input: SendBillingEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `${input.planLabel} has renewed`,
    react: BillingRenewedEmail(input),
  })
}

export async function sendBillingFailedEmail(input: SendBillingEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `We couldn’t process payment for ${input.workspaceName}`,
    react: BillingFailedEmail(input),
  })
}

export async function sendBillingCanceledEmail(input: SendBillingEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `${input.planLabel} has been canceled`,
    react: BillingCanceledEmail(input),
  })
}
