import { Resend } from 'resend'
import { getResendApiKey } from './env.js'

let client: Resend | null = null

export function getResend(): Resend | null {
  const apiKey = getResendApiKey()
  if (!apiKey) return null
  if (!client) {
    client = new Resend(apiKey)
  }
  return client
}
