import { Webhooks } from '@polar-sh/nextjs'
import { revalidateTag } from 'next/cache'

import { forwardPolarWebhookEvent } from '@/lib/polar/internal-webhook-relay'
import { POLAR_PRODUCTS_CACHE_TAG } from '@/lib/polar/polar-products'
import type {
  PolarOrderWebhookData,
  PolarSubscriptionWebhookData,
  PolarWebhookEventType,
} from '@socialista/types'

const forward = async (
  type: PolarWebhookEventType,
  data: PolarSubscriptionWebhookData | PolarOrderWebhookData,
) => {
  await forwardPolarWebhookEvent(type, data)
  revalidateTag(POLAR_PRODUCTS_CACHE_TAG, 'max')
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async payload => {
    await forward('subscription.created', payload.data)
  },
  onSubscriptionUpdated: async payload => {
    await forward('subscription.updated', payload.data)
  },
  onSubscriptionActive: async payload => {
    await forward('subscription.active', payload.data)
  },
  onSubscriptionCanceled: async payload => {
    await forward('subscription.canceled', payload.data)
  },
  onSubscriptionRevoked: async payload => {
    await forward('subscription.revoked', payload.data)
  },
  onSubscriptionUncanceled: async payload => {
    await forward('subscription.uncanceled', payload.data)
  },
  onOrderCreated: async payload => {
    await forward('order.created', payload.data)
  },
  onOrderUpdated: async payload => {
    await forward('order.updated', payload.data)
  },
  onOrderPaid: async payload => {
    await forward('order.paid', payload.data)
  },
})
