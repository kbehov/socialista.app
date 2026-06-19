'use client'

import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import {
  buildInspirationFilterFields,
  buildInspirationQueryString,
  clearInspirationFiltersQuery,
  hasActiveInspirationFilters,
} from '@/lib/inspiration-filters'
import { cn } from '@/lib/utils'
import type { InspirationCategoryResponse, InspirationNicheResponse } from '@socialista/types'
import { Loader2, Settings2Icon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useTransition } from 'react'

type InspirationsToolbarProps = {
  categories: InspirationCategoryResponse[]
  niches: InspirationNicheResponse[]
  filters: Filter<string>[]
  total: number
}

export function InspirationsToolbar({ categories, niches, filters, total }: InspirationsToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const fields = useMemo(() => buildInspirationFilterFields(categories, niches), [categories, niches])
  const activeFilters = hasActiveInspirationFilters(filters)

  const navigate = (query: string) => {
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const handleFiltersChange = (nextFilters: Filter<string>[]) => {
    navigate(buildInspirationQueryString(nextFilters, new URLSearchParams(searchParams.toString())))
  }

  const handleClearFilters = () => {
    navigate(clearInspirationFiltersQuery(new URLSearchParams(searchParams.toString())))
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 transition-opacity sm:flex-row sm:items-end sm:justify-between',
        isPending && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <Filters
          filters={filters}
          fields={fields}
          onChange={handleFiltersChange}
          size="sm"
          className="gap-2"
          trigger={
            <Button variant="outline" size="sm">
              <Settings2Icon />
            </Button>
          }
        />
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        <span>
          {total} {total === 1 ? 'item' : 'items'}
        </span>
        {activeFilters && (
          <>
            <span className="text-border">·</span>
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={isPending}
              className="text-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}
