import { model, Schema } from 'mongoose'

export type PolarWebhookEventRecord = {
  eventKey: string
  processedAt: Date
}

const polarWebhookEventSchema = new Schema<PolarWebhookEventRecord>(
  {
    eventKey: { type: String, required: true, unique: true },
    processedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false },
)

polarWebhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

export const PolarWebhookEventModel = model<PolarWebhookEventRecord>(
  'PolarWebhookEvent',
  polarWebhookEventSchema,
)
