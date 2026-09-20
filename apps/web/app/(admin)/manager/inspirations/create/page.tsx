import { PageHeader } from '@/components/headers/page-header'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getInspirationCategories, getInspirationNiches } from '@/services/inspiration.service'
import { InspirationCreateWrapper } from '../_components/inspiration-create'

export default async function CreateInspirationPage() {
  const [categories, niches] = await Promise.all([
    getInspirationCategories('limit=100&sort=name'),
    getInspirationNiches('limit=100&sort=name'),
  ])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Create inspiration"
        description="Import a TikTok post."
        breadcrumbs={[
          { label: 'Manager', href: MANAGER_ROUTES.ROOT },
          { label: 'Inspirations', href: MANAGER_ROUTES.INSPIRATIONS },
          { label: 'Create' },
        ]}
        backHref={MANAGER_ROUTES.INSPIRATIONS}
      />

      <InspirationCreateWrapper categories={categories.data?.categories ?? []} niches={niches.data?.niches ?? []} />
    </div>
  )
}
