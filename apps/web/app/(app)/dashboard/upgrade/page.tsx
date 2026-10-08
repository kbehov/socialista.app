import { UpgradePageContent } from '@/components/paywall/upgrade-page-content'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getPolarProducts } from '@/services/billing.service'

export const metadata = createDashboardMetadata('Upgrade')

type UpgradePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams
  const checkoutSuccess = params.success === 'true'

  const response = await getPolarProducts({ recurringOnly: true })

  return (
    <UpgradePageContent
      products={response.data?.products ?? []}
      loadError={response.success ? null : (response.message ?? 'Failed to load plans')}
      checkoutSuccess={checkoutSuccess}
    />
  )
}
