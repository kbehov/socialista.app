import { tryMarkEventProcessed } from '@socialista/db'

export const acquireWebhookEvent = async (eventKey: string): Promise<boolean> => {
  return await tryMarkEventProcessed(eventKey)
}

export const buildWebhookEventKey = (eventType: string, entityId: string) => `${eventType}:${entityId}`
