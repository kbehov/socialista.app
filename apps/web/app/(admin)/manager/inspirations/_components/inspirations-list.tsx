'use client'

import { InspirationCard } from '@/components/cards/inspiration-card'
import type { Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { useInspirationFilters } from '@/hooks/use-inspiration-filters'
import { hasActiveInspirationFilters } from '@/lib/inspiration-filters'
import type { InspirationResponse } from '@socialista/types'
import { ImageIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'

type InspirationsListProps = {
  inspirations: InspirationResponse[]
  filters: Filter<string>[]
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const { isPending, clearFilters } = useInspirationFilters()

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <ImageIcon className="size-4 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">
        {hasFilters ? 'No matching inspirations' : 'No inspirations yet'}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your filters to broaden the results.'
          : 'Import a TikTok post to start building your library.'}
      </p>

      <div className="mt-5 flex items-center gap-2">
        {hasFilters && (
          <Button type="button" variant="outline" size="sm" onClick={clearFilters} disabled={isPending}>
            Clear filters
          </Button>
        )}
        <Button asChild size="sm">
          <Link href="/manager/inspirations/create">
            <PlusIcon className="size-3.5" />
            Add inspiration
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function InspirationsList({ inspirations, filters }: InspirationsListProps) {
  const hasFilters = hasActiveInspirationFilters(filters)

  if (inspirations.length === 0) {
    return <EmptyState hasFilters={hasFilters} />
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 ">
      {inspirations.map(inspiration => (
        <InspirationCard key={inspiration._id} inspiration={inspiration} />
      ))}
    </div>
  )
}
