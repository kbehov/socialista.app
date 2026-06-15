import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const getStripeWebhookSecret = (): string => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }
  return secret
}

export const createStripeCustomer = async (email: string, name: string, workspaceId: string) => {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      workspaceId,
    },
  })
  return customer
}

export const getStripeCustomer = async (customerId: string) => {
  const customer = await stripe.customers.retrieve(customerId)
  return customer
}
