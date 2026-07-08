import type { PolarProduct } from '@socialista/types'

export type PaywallReason =
  | 'generic'
  | 'posts_limit'
  | 'storage_limit'
  | 'members_limit'
  | 'accounts_limit'
  | 'ai_credits'
  | 'feature_locked'

export type PaywallCopy = {
  eyebrow: string
  title: string
  description: string
}

export const PAYWALL_COPY: Record<PaywallReason, PaywallCopy> = {
  generic: {
    eyebrow: 'Upgrade your workspace',
    title: 'Grow faster with the right plan',
    description:
      'Unlock higher limits, AI credits, and collaboration tools built for creators and teams who publish consistently.',
  },
  posts_limit: {
    eyebrow: 'Post limit reached',
    title: 'Keep your content calendar moving',
    description:
      'You have reached your scheduled post limit. Upgrade to publish more content without slowing down your growth.',
  },
  storage_limit: {
    eyebrow: 'Storage limit reached',
    title: 'Make room for more creative assets',
    description:
      'Your workspace is out of storage. Upgrade to upload more media, reuse assets, and ship content faster.',
  },
  members_limit: {
    eyebrow: 'Team limit reached',
    title: 'Bring your team into one workspace',
    description:
      'You have reached your member limit. Upgrade to invite collaborators and manage social publishing together.',
  },
  accounts_limit: {
    eyebrow: 'Account limit reached',
    title: 'Connect more social channels',
    description:
      'You have reached your connected account limit. Upgrade to manage more profiles from a single workspace.',
  },
  ai_credits: {
    eyebrow: 'AI credits required',
    title: 'Create more with AI assistance',
    description:
      'You need more AI credits to continue. Upgrade for included credits and keep generating content without interruption.',
  },
  feature_locked: {
    eyebrow: 'Pro feature',
    title: 'Unlock this feature on a paid plan',
    description:
      'This capability is available on paid plans. Upgrade to access advanced workflows and higher workspace limits.',
  },
}

export const getPaywallCopy = (
  reason: PaywallReason,
  overrides?: Partial<PaywallCopy>,
): PaywallCopy => ({
  ...PAYWALL_COPY[reason],
  ...overrides,
})

export const resolveFeaturedProductId = (products: PolarProduct[], preferredId?: string) => {
  if (preferredId && products.some(product => product.id === preferredId)) {
    return preferredId
  }

  const metadataFeatured = products.find(product => product.metadata.featured === true)
  if (metadataFeatured) return metadataFeatured.id

  const configuredProProductId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID
  if (configuredProProductId && products.some(product => product.id === configuredProProductId)) {
    return configuredProProductId
  }

  if (products.length >= 3) {
    return products[Math.floor(products.length / 2)]?.id
  }

  return products[0]?.id
}

export const mapWorkspacePlanToProduct = (
  products: PolarProduct[],
  currentPlan: 'free' | 'pro' | 'enterprise' | undefined,
) => {
  if (!currentPlan || currentPlan === 'free') return undefined

  const normalizedPlan = currentPlan.toLowerCase()

  return products.find(product => {
    const name = product.name.toLowerCase()
    const plan = typeof product.metadata.plan === 'string' ? product.metadata.plan.toLowerCase() : ''
    return name.includes(normalizedPlan) || plan === normalizedPlan
  })?.id
}
