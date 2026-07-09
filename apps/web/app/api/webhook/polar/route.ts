import { Webhooks } from '@polar-sh/nextjs'

import { forwardPolarWebhookEvent } from '@/lib/polar/polar-billing-api'

const forwardSubscription = async (type: Parameters<typeof forwardPolarWebhookEvent>[0], data: { id: string }) =>
  await forwardPolarWebhookEvent(type, data)

const forwardOrder = async (type: Parameters<typeof forwardPolarWebhookEvent>[0], data: { id: string }) =>
  await forwardPolarWebhookEvent(type, data)

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async payload => {
    await forwardSubscription('subscription.created', payload.data)
  },
  onSubscriptionUpdated: async payload => {
    await forwardSubscription('subscription.updated', payload.data)
  },
  onSubscriptionActive: async payload => {
    await forwardSubscription('subscription.active', payload.data)
  },
  onSubscriptionCanceled: async payload => {
    await forwardSubscription('subscription.canceled', payload.data)
  },
  onSubscriptionRevoked: async payload => {
    await forwardSubscription('subscription.revoked', payload.data)
  },
  onSubscriptionUncanceled: async payload => {
    await forwardSubscription('subscription.uncanceled', payload.data)
  },
  onOrderCreated: async payload => {
    await forwardOrder('order.created', payload.data)
  },
  onOrderUpdated: async payload => {
    await forwardOrder('order.updated', payload.data)
  },
  onOrderPaid: async payload => {
    await forwardOrder('order.paid', payload.data)
  },
})
