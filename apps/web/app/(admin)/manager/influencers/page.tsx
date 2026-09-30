import { PageHeader } from '@/components/headers/page-header'
import { SmartPagination } from '@/components/common/smart-pagination'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import {
  buildListQueryFromSearchParams,
  parseFiltersFromSearchParams,
} from '@/lib/manager-influencer-filters'
import { listAdminInfluencers } from '@/services/influencer.service'
import type { MetaResponse } from '@socialista/types'
import { InfluencerActions } from './_components/influencer-actions'
import { InfluencersList } from './_components/influencers-list'
import { InfluencersToolbar } from './_components/influencers-toolbar'

type InfluencersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 12,
  hasNextPage: false,
  hasPreviousPage: false,
}

export default async function ManagerInfluencersPage({ searchParams }: InfluencersPageProps) {
  const params = await searchParams
  const filters = parseFiltersFromSearchParams(params)
  const listQuery = buildListQueryFromSearchParams(params, filters)

  const result = await listAdminInfluencers(listQuery)
  const influencers = result.data?.influencers ?? []
  const meta = result.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Influencers"
        description="Browse all generated influencers and manage the public library."
        breadcrumbs={[{ label: 'Manager', href: MANAGER_ROUTES.ROOT }, { label: 'Influencers' }]}
        actions={<InfluencerActions />}
      />

      <section className="flex flex-col gap-6">
        <InfluencersToolbar filters={filters} total={meta.total} />
        <InfluencersList influencers={influencers} filters={filters} />
        <SmartPagination meta={meta} />
      </section>
    </div>
  )
}
