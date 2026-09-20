import { TaxonomyGrid } from '../../_components/taxonomy-grid'
import { PageHeader } from '@/components/headers/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { getInspirationNiches } from '@/services/inspiration.service'
import { ShapesIcon } from 'lucide-react'

export default async function NichesPage() {
  const niches = await getInspirationNiches('limit=100&sort=name')
  const items = niches.data?.niches ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Niches"
        description="Audience niches used to filter inspirations."
        actions={<InspirationActions />}
        breadcrumbs={[
          { label: 'Manager', href: MANAGER_ROUTES.ROOT },
          { label: 'Inspirations', href: MANAGER_ROUTES.INSPIRATIONS },
          { label: 'Niches' },
        ]}
      />
      <TaxonomyGrid
        items={items}
        emptyIcon={ShapesIcon}
        emptyTitle="No niches yet"
        emptyDescription="Create a niche so inspirations can be tagged by audience."
        countLabel={count => `${count} ${count === 1 ? 'inspiration' : 'inspirations'}`}
      />
    </div>
  )
}
