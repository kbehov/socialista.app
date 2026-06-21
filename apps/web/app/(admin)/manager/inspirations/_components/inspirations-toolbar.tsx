'use client'

import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { useInspirationFilters } from '@/hooks/use-inspiration-filters'
import { buildInspirationFilterFields, hasActiveInspirationFilters } from '@/lib/inspiration-filters'
import { cn } from '@/lib/utils'
import type { InspirationCategoryResponse, InspirationNicheResponse } from '@socialista/types'
import { ListFilterIcon, Loader2Icon } from 'lucide-react'
import { useMemo } from 'react'

type InspirationsToolbarProps = {
  categories: InspirationCategoryResponse[]
  niches: InspirationNicheResponse[]
  filters: Filter<string>[]
  total: number
}

export function InspirationsToolbar({ categories, niches, filters, total }: InspirationsToolbarProps) {
  const { isPending, applyFilters, clearFilters } = useInspirationFilters()
  const fields = useMemo(() => buildInspirationFilterFields(categories, niches), [categories, niches])
  const hasFilters = hasActiveInspirationFilters(filters)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      <Filters
        filters={filters}
        fields={fields}
        onChange={applyFilters}
        size="sm"
        className="gap-2"
        trigger={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
            <ListFilterIcon className="size-3.5" />
            Filters
          </Button>
        }
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
        <span className="tabular-nums">
          {total} {total === 1 ? 'item' : 'items'}
        </span>
        {hasFilters && (
          <>
            <span aria-hidden className="text-border">
              ·
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  )
}
