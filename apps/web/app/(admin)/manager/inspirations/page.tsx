import { PageHeader } from '@/components/common/page-header'
import { InspirationActions } from '@/components/inspirations/inspiration-actions'
import { parseFiltersFromSearchParams, toSearchParamsRecord } from '@/lib/inspiration-filters'
import {
  getInspirationCategories,
  getInspirationNiches,
  getInspirations,
} from '@/services/inspiration.service'
import type { MetaResponse } from '@socialista/types'

import { InspirationsPageContent } from './_components/inspirations-page-content'

type InspirationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
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

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 12,
  hasNextPage: false,
  hasPreviousPage: false,
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
    <>
      <PageHeader
        title="Inspirations"
        description="Browse and organize TikTok content."
        breadcrumbs={[{ label: 'Manager', href: '/manager' }, { label: 'Inspirations' }]}
        actions={<InspirationActions />}
      />

      <InspirationsPageContent
        inspirations={inspirations}
        meta={meta}
        categories={categories}
        niches={niches}
        filters={filters}
      />
    </>
  )
}
