'use client'

import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useManagerInfluencerFilters } from '@/hooks/use-manager-influencer-filters'
import {
  buildInfluencerFilterFields,
  hasActiveInfluencerFilters,
  parseVisibilityTab,
  type ManagerInfluencerVisibilityTab,
  visibilityTabToParam,
} from '@/lib/manager-influencer-filters'
import { cn } from '@/lib/utils'
import { ListFilterIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useTransition } from 'react'

type InfluencersToolbarProps = {
  filters: Filter<string>[]
  total: number
}

function setVisibilityTab(
  tab: ManagerInfluencerVisibilityTab,
  searchParams: URLSearchParams,
  pathname: string,
  navigate: (query: string) => void,
) {
  const params = new URLSearchParams(searchParams.toString())
  params.delete('page')
  const visibility = visibilityTabToParam(tab)
  if (visibility) params.set('visibility', visibility)
  else params.delete('visibility')
  const query = params.toString()
  navigate(query ? `${pathname}?${query}` : pathname)
}

export function InfluencersToolbar({ filters, total }: InfluencersToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, applyFilters, clearFilters } = useManagerInfluencerFilters()
  const [searchPending, startSearchTransition] = useTransition()
  const fields = useMemo(() => buildInfluencerFilterFields({ includeStatus: true }), [])
  const hasFilters = hasActiveInfluencerFilters(filters)
  const visibilityTab = parseVisibilityTab(Object.fromEntries(searchParams.entries()))
  const searchValue = searchParams.get('query') ?? ''

  const navigate = (query: string) => {
    startSearchTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const queryText = String(formData.get('query') ?? '').trim()
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (queryText) params.set('query', queryText)
    else params.delete('query')
    const next = params.toString()
    navigate(next ? `${pathname}?${next}` : pathname)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DashboardSegment aria-label="Visibility">
          <DashboardSegmentButton
            active={visibilityTab === 'all'}
            onClick={() =>
              setVisibilityTab('all', new URLSearchParams(searchParams.toString()), pathname, navigate)
            }
          >
            All
          </DashboardSegmentButton>
          <DashboardSegmentButton
            active={visibilityTab === 'public'}
            onClick={() =>
              setVisibilityTab('public', new URLSearchParams(searchParams.toString()), pathname, navigate)
            }
          >
            Public
          </DashboardSegmentButton>
          <DashboardSegmentButton
            active={visibilityTab === 'private'}
            onClick={() =>
              setVisibilityTab('private', new URLSearchParams(searchParams.toString()), pathname, navigate)
            }
          >
            Private
          </DashboardSegmentButton>
        </DashboardSegment>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="query"
            defaultValue={searchValue}
            placeholder="Search name or bio"
            className="h-8 pl-8 text-sm"
          />
        </form>
      </div>

      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          (isPending || searchPending) && 'pointer-events-none opacity-60',
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
          {(isPending || searchPending) && <Loader2Icon className="size-3.5 animate-spin" />}
          <span className="tabular-nums">
            {total} {total === 1 ? 'influencer' : 'influencers'}
          </span>
          {hasFilters ? (
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
          ) : null}
        </div>
      </div>
    </div>
  )
}
