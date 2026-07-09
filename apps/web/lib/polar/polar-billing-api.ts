import { API_URL, WORKSPACE_ROUTES } from '@/constants/routes'
import type { PolarWebhookEventType } from '@socialista/types'

const getInternalWebhookSecret = () => {
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('POLAR_WEBHOOK_SECRET is not configured')
  }
  return secret
}

const serializeValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]))
  }

  return value
}

export const forwardPolarWebhookEvent = async (type: PolarWebhookEventType, data: unknown) => {
  const response = await fetch(`${API_URL}${WORKSPACE_ROUTES.PROCESS_POLAR_WEBHOOK}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-webhook-secret': getInternalWebhookSecret(),
    },
    body: JSON.stringify({
      type,
      data: serializeValue(data),
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Billing API webhook failed (${response.status}): ${message}`)
  }

  return response.json() as Promise<{ success: boolean; data?: { received: boolean; handled: boolean } }>
}
