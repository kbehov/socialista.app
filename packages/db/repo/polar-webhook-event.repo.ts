import { PolarWebhookEventModel } from '../models/polar-webhook-event.model.js'
import { isDuplicateKeyError } from '../utils/is-duplicate-key-error.js'

export const tryMarkEventProcessed = async (eventKey: string): Promise<boolean> => {
  try {
    await PolarWebhookEventModel.create({ eventKey, processedAt: new Date() })
    return true
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return false
    }
    throw error
  }
}
