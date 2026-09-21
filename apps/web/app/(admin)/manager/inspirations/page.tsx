import { PageHeader } from '@/components/headers/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { parseFiltersFromSearchParams, toSearchParamsRecord } from '@/lib/inspiration-filters'
import { getInspirationCategories, getInspirationNiches, getInspirations } from '@/services/inspiration.service'
import type { MetaResponse } from '@socialista/types'
import { InspirationsList } from './_components/inspirations-list'
import { SmartPagination } from '@/components/common/smart-pagination'
import { InspirationsToolbar } from './_components/inspirations-toolbar'
import { MANAGER_ROUTES } from '@/constants/app-routes'

type InspirationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 12,
  hasNextPage: false,
  hasPreviousPage: false,
}

function getInspirationListQuery(searchParams: Record<string, string | string[] | undefined>): string {
  const params = toSearchParamsRecord(searchParams)

  if (!params.has('limit')) {
    params.set('limit', '12')
  }

  if (!params.has('page')) {
    params.set('page', '1')
  }

  return params.toString()
}

export default async function InspirationsPage({ searchParams }: InspirationsPageProps) {
  const params = await searchParams
  const query = getInspirationListQuery(params)
  const filters = parseFiltersFromSearchParams(params)

  const [categoriesResult, nichesResult, inspirationsResult] = await Promise.all([
    getInspirationCategories('limit=100&sort=name'),
    getInspirationNiches('limit=100&sort=name'),
    getInspirations(query),
  ])

  const categories = categoriesResult.data?.categories ?? []
  const niches = nichesResult.data?.niches ?? []
  const inspirations = inspirationsResult.data?.inspirations ?? []
  const meta = inspirationsResult.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Inspirations"
        description="Import TikTok posts and keep the studio library current."
        breadcrumbs={[{ label: 'Manager', href: MANAGER_ROUTES.ROOT }, { label: 'Inspirations' }]}
        actions={<InspirationActions />}
      />

      <section className="flex flex-col gap-6">
        <InspirationsToolbar categories={categories} niches={niches} filters={filters} total={meta.total} />
        <InspirationsList inspirations={inspirations} filters={filters} />
        <SmartPagination meta={meta} />
      </section>
    </div>
  )
}
