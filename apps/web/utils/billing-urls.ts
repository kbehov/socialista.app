import { BILLING_ROUTES } from '@/constants/routes'

export const getProductCheckoutUrl = (productId: string, workspaceId?: string) => {
  const metadata = workspaceId ? `&metadata=${encodeURIComponent(JSON.stringify({ workspaceId }))}` : ''

  return `${BILLING_ROUTES.CHECKOUT}?products=${productId}${metadata}`
}

export const getUpgradeCheckoutUrl = (workspaceId: string) => {
  const productId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID ?? process.env.POLAR_PRO_PRODUCT_ID
  if (!productId) {
    throw new Error('POLAR_PRO_PRODUCT_ID is not configured')
  }

  return getProductCheckoutUrl(productId, workspaceId)
}

export const getBillingPortalUrl = (workspaceId: string) => {
  return `${BILLING_ROUTES.PORTAL}?workspaceId=${encodeURIComponent(workspaceId)}`
}
