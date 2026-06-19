'use client'

import type { Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { clearInspirationFiltersQuery, hasActiveInspirationFilters } from '@/lib/inspiration-filters'
import type { InspirationResponse } from '@socialista/types'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type InspirationsListProps = {
  inspirations: InspirationResponse[]
  filters: Filter<string>[]
}

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return String(value)
}

function InspirationCard({ inspiration }: { inspiration: InspirationResponse }) {
  const cover = inspiration.video?.coverUrl || inspiration.images[0]?.url
  const author = inspiration.author.nickName || inspiration.author.username || 'Unknown'
  const handle = inspiration.author.username ? `@${inspiration.author.username}` : null
  const type = inspiration.contentType === 'slideshow' ? 'Slideshow' : 'Video'
  const tags = [...inspiration.categories.map(c => c.name), ...inspiration.niches.map(n => n.name)]

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <span className="text-xs">No preview</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{author}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[handle, type, `${formatCount(inspiration.stats.likes)} likes`, `${formatCount(inspiration.stats.plays)} views`]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {tags.length > 0 && (
          <p className="truncate text-xs text-muted-foreground/70">{tags.join(', ')}</p>
        )}
      </div>
    </article>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const clearFilters = () => {
    const query = clearInspirationFiltersQuery(new URLSearchParams(searchParams.toString()))
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        {hasFilters ? 'No results' : 'No inspirations yet'}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {hasFilters
          ? 'Adjust your filters to see more items.'
          : 'Import a TikTok post to get started.'}
      </p>

      <div className="mt-5 flex items-center gap-2">
        {hasFilters && (
          <Button type="button" variant="outline" size="sm" onClick={clearFilters} disabled={isPending}>
            Reset filters
          </Button>
        )}
        <Button asChild size="sm">
          <Link href="/manager/inspirations/create">Create</Link>
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {inspirations.map(inspiration => (
        <InspirationCard key={inspiration._id} inspiration={inspiration} />
      ))}
    </div>
  )
}
