import { Plan } from '@socialista/db'

const parseProductPlanMap = (): Map<string, Plan> => {
  const raw = process.env.POLAR_PRODUCT_PLAN_MAP
  const map = new Map<string, Plan>()

  if (raw) {
    for (const entry of raw.split(',')) {
      const [productId, planValue] = entry.split('=').map(part => part.trim())
      if (!productId || !planValue) continue

      if (Object.values(Plan).includes(planValue as Plan)) {
        map.set(productId, planValue as Plan)
      }
    }
  }

  const proProductId = process.env.POLAR_PRO_PRODUCT_ID
  if (proProductId && !map.has(proProductId)) {
    map.set(proProductId, Plan.PRO)
  }

  return map
}

const productPlanMap = parseProductPlanMap()

export const resolvePlanFromProductId = (productId?: string | null): Plan => {
  if (!productId) {
    console.warn('[polar] resolvePlanFromProductId: missing productId, defaulting to free')
    return Plan.FREE
  }

  const plan = productPlanMap.get(productId)
  if (plan) return plan

  console.warn('[polar] resolvePlanFromProductId: unknown product', productId)
  return Plan.FREE
}
