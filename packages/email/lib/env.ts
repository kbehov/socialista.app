const DEFAULT_APP_URL = 'http://localhost:3000'

export function getAppUrl(): string {
  return process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL
}

export function getEmailFrom(): string | undefined {
  const from = process.env.EMAIL_FROM?.trim()
  return from || undefined
}

export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim()
  return key || undefined
}
