'use client'

import type { Filter } from '@/components/reui/filters'
import type {
  InspirationCategoryResponse,
  InspirationNicheResponse,
  InspirationResponse,
  MetaResponse,
} from '@socialista/types'
import { Suspense } from 'react'

import { InspirationsList } from './inspirations-list'
import { InspirationsPagination } from './inspirations-pagination'
import { InspirationsToolbar } from './inspirations-toolbar'

type InspirationsPageContentProps = {
  inspirations: InspirationResponse[]
  meta: MetaResponse
  categories: InspirationCategoryResponse[]
  niches: InspirationNicheResponse[]
  filters: Filter<string>[]
}

function ToolbarFallback() {
  return (
    <div className="border-b border-border pb-6">
      <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

function PaginationFallback() {
  return <div className="h-8 w-48 animate-pulse rounded bg-muted" />
}

export function InspirationsPageContent({
  inspirations,
  meta,
  categories,
  niches,
  filters,
}: InspirationsPageContentProps) {
  return (
    <div className="space-y-8">
      <Suspense fallback={<ToolbarFallback />}>
        <InspirationsToolbar
          categories={categories}
          niches={niches}
          filters={filters}
          total={meta.total}
        />
      </Suspense>

      <InspirationsList inspirations={inspirations} filters={filters} />

      <Suspense fallback={<PaginationFallback />}>
        <InspirationsPagination meta={meta} />
      </Suspense>
    </div>
  )
}
