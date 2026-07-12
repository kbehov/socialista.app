import { UpgradePageContent } from '@/components/paywall/upgrade-page-content'
import { getPolarProducts } from '@/services/billing.service'

type UpgradePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams
  const checkoutSuccess = params.success === 'true'

  const response = await getPolarProducts({ recurringOnly: true })
  console.log(
    'response',
    response.data?.products.map(product => ({
      benefits: product.benefits,
      metadata: product.metadata,
    })),
  )

  return (
    <UpgradePageContent
      products={response.data?.products ?? []}
      loadError={response.success ? null : (response.message ?? 'Failed to load plans')}
      checkoutSuccess={checkoutSuccess}
    />
  )
}
