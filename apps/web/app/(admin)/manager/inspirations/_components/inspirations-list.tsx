'use client'

import { InspirationCard } from '@/components/cards/inspiration-card'
import { EmptyState } from '@/components/common/empty-state'
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

function InspirationsEmptyState({ hasFilters }: { hasFilters: boolean }) {
  const { isPending, clearFilters } = useInspirationFilters()

  return (
    <EmptyState
      minHeight="lg"
      icon={ImageIcon}
      title={hasFilters ? 'No matching inspirations' : 'No inspirations yet'}
      description={
        hasFilters
          ? 'Try adjusting your filters to broaden the results.'
          : 'Import a TikTok post to start building your library.'
      }
      action={
        <>
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
        </>
      }
    />
  )
}

export function InspirationsList({ inspirations, filters }: InspirationsListProps) {
  const hasFilters = hasActiveInspirationFilters(filters)

  if (inspirations.length === 0) {
    return <InspirationsEmptyState hasFilters={hasFilters} />
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 ">
      {inspirations.map(inspiration => (
        <InspirationCard key={inspiration._id} inspiration={inspiration} />
      ))}
    </div>
  )
}
