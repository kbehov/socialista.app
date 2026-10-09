import { HttpError } from '@/utils/http-response.js'
import { PLAN_LIMITS, Plan, type PlanLimits } from '@socialista/db'
import type { PolarWebhookMetadata, PolarWebhookProduct } from '@socialista/types'

const parseProductPlanMap = (): Map<string, Plan> => {
  const raw = process.env.POLAR_PRODUCT_PLAN_MAP
  const map = new Map<string, Plan>()

  if (raw) {
    for (const entry of raw.split(',')) {
      const [productId, planValue] = entry.split('=').map(part => part.trim())
      if (!productId || !planValue) continue

      if (planValue === Plan.FREE) {
        map.set(productId, Plan.FREE)
      }
    }
  }

  return map
}

const productPlanMap = parseProductPlanMap()

export type ProductPlanInput = {
  productId?: string | null
  productName?: string | null
  metadata?: PolarWebhookMetadata | null
}

const isFreeProduct = ({ productId, productName, metadata }: ProductPlanInput) => {
  const metaPlan = typeof metadata?.plan === 'string' ? metadata.plan.trim().toLowerCase() : ''
  if (metaPlan === 'free') return true
  if (productName?.trim().toLowerCase() === 'free') return true
  if (productId && productPlanMap.get(productId) === Plan.FREE) return true
  return false
}

/**
 * Free Polar products stay on the free workspace.
 * Creator, Pro, Studio, and any other paid product are a Pro workspace.
 * Limits still come from that product's metadata.
 */
export const resolveWorkspacePlan = (input: ProductPlanInput): Plan => {
  if (isFreeProduct(input)) return Plan.FREE

  if (!input.productId && !input.productName?.trim()) {
    throw new HttpError(400, 'Polar product id is missing')
  }

  return Plan.PRO
}

export const resolvePlanFromProductId = (productId?: string | null): Plan =>
  resolveWorkspacePlan({ productId })

const metadataNumber = (value: string | number | boolean | undefined): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }

  return undefined
}

export type ProvisionedPlanLimits = Pick<PlanLimits, 'members' | 'posts' | 'storage' | 'accounts' | 'aiCredits'>

/** Product metadata wins. Missing keys fall back to the workspace plan's catalog limits. */
export const limitsFromProductMetadata = (
  metadata: PolarWebhookMetadata | null | undefined,
  plan: Plan,
): ProvisionedPlanLimits => {
  const fallback = PLAN_LIMITS[plan]

  return {
    members: metadataNumber(metadata?.members) ?? fallback.members,
    posts: metadataNumber(metadata?.posts) ?? fallback.posts,
    storage: metadataNumber(metadata?.storage) ?? fallback.storage,
    accounts: metadataNumber(metadata?.accounts) ?? fallback.accounts,
    aiCredits: metadataNumber(metadata?.credits) ?? fallback.aiCredits,
  }
}

export const planFromProduct = (product: PolarWebhookProduct | null | undefined, productId?: string | null) => {
  const plan = resolveWorkspacePlan({
    productId: product?.id ?? productId,
    productName: product?.name,
    metadata: product?.metadata,
  })

  return {
    plan,
    limits: limitsFromProductMetadata(product?.metadata, plan),
    label: product?.name?.trim() || plan.charAt(0).toUpperCase() + plan.slice(1),
    productId: product?.id ?? productId ?? undefined,
  }
}
