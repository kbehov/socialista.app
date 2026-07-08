import { Webhooks } from '@polar-sh/nextjs'

import { ensureDb } from '@/lib/db'
import {
  handleSubscriptionActive,
  handleSubscriptionCanceled,
  handleSubscriptionCreated,
  handleSubscriptionRevoked,
  handleSubscriptionUpdated,
} from '@/lib/polar-billing'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async payload => {
    await ensureDb()
    await handleSubscriptionCreated(payload.data)
  },
  onSubscriptionUpdated: async payload => {
    await ensureDb()
    await handleSubscriptionUpdated(payload.data)
  },
  onSubscriptionActive: async payload => {
    await ensureDb()
    await handleSubscriptionActive(payload.data)
  },
  onSubscriptionCanceled: async payload => {
    await ensureDb()
    await handleSubscriptionCanceled(payload.data)
  },
  onSubscriptionRevoked: async payload => {
    await ensureDb()
    await handleSubscriptionRevoked(payload.data)
  },
})
