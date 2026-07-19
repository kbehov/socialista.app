import type { HydratedDocument } from 'mongoose'

export type IWaitlistEntry = {
  _id: string
  email: string
  source?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
  createdAt: Date
  updatedAt: Date
}

export type WaitlistDocument = HydratedDocument<IWaitlistEntry>

export type CreateWaitlistEntryInput = {
  email: string
  source?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
}
