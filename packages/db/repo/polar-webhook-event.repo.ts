import { PolarWebhookEventModel } from '../models/polar-webhook-event.model.js'

export const tryMarkEventProcessed = async (eventKey: string): Promise<boolean> => {
  try {
    await PolarWebhookEventModel.create({ eventKey, processedAt: new Date() })
    return true
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return false
    }
    throw error
  }
}
