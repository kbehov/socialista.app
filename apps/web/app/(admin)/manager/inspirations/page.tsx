import { PageHeader } from '@/components/common/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { parseFiltersFromSearchParams, toSearchParamsRecord } from '@/lib/inspiration-filters'
import { getInspirationCategories, getInspirationNiches, getInspirations } from '@/services/inspiration.service'
import type { MetaResponse } from '@socialista/types'
import { InspirationsList } from './_components/inspirations-list'
import { InspirationsPagination } from './_components/inspirations-pagination'
import { InspirationsToolbar } from './_components/inspirations-toolbar'

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
  const meta = inspirationsResult.data?.meta ?? defaultMeta

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Inspirations"
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Inspirations' }]}
        actions={<InspirationActions />}
      />

      <section className="flex flex-col gap-6">
        <InspirationsToolbar categories={categories} niches={niches} filters={filters} total={meta.total} />
        <InspirationsList inspirations={inspirations} filters={filters} />
        <InspirationsPagination meta={meta} />
      </section>
    </div>
  )
}
