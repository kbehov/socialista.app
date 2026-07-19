import { model, Schema } from 'mongoose'
import type { IWaitlistEntry } from '../types/waitlist.types.js'

const waitlistSchema = new Schema<IWaitlistEntry>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    source: { type: String, trim: true, maxlength: 120 },
    utmSource: { type: String, trim: true, maxlength: 120 },
    utmMedium: { type: String, trim: true, maxlength: 120 },
    utmCampaign: { type: String, trim: true, maxlength: 120 },
    referrer: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
)

waitlistSchema.index({ createdAt: -1 })

export const WaitlistModel = model<IWaitlistEntry>('Waitlist', waitlistSchema)
