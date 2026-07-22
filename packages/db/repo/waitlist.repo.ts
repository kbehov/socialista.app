import { WaitlistModel } from '../models/waitlist.model.js'
import type { CreateWaitlistEntryInput, IWaitlistEntry } from '../types/waitlist.types.js'
import { isDuplicateKeyError } from '../utils/is-duplicate-key-error.js'

export async function findWaitlistByEmail(email: string): Promise<IWaitlistEntry | null> {
  return WaitlistModel.findOne({ email: email.trim().toLowerCase() }).lean()
}

export async function createWaitlistEntry(
  input: CreateWaitlistEntryInput,
): Promise<{ entry: IWaitlistEntry; created: boolean }> {
  const email = input.email.trim().toLowerCase()

  const existing = await findWaitlistByEmail(email)
  if (existing) {
    return { entry: existing, created: false }
  }

  try {
    const entry = await WaitlistModel.create({
      email,
      source: input.source,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      referrer: input.referrer,
    })
    return { entry: entry.toObject(), created: true }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const entry = await findWaitlistByEmail(email)
      if (entry) {
        return { entry, created: false }
      }
    }
    throw error
  }
}
