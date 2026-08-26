'use client'

import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard/dashboard-segment'
import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { usePostFilters } from '@/hooks/use-post-filters'
import { buildPostFilterFields, hasActivePostFilters, type PostViewMode } from '@/lib/posts/post-filters'
import { cn } from '@/lib/utils'
import type { AccountSummary } from '@socialista/types'
import { CalendarDaysIcon, LayoutGridIcon, ListFilterIcon, Loader2Icon } from 'lucide-react'
import { useMemo } from 'react'

const VIEW_OPTIONS: Array<{
  value: PostViewMode
  label: string
  shortLabel: string
  Icon: typeof LayoutGridIcon
}> = [
  { value: 'list', label: 'Grid', shortLabel: 'Grid', Icon: LayoutGridIcon },
  { value: 'calendar', label: 'Calendar', shortLabel: 'Cal', Icon: CalendarDaysIcon },
]

type PostsToolbarProps = {
  accounts: AccountSummary[]
  filters: Filter<string>[]
  total: number
  view: PostViewMode
}

export function PostsToolbar({ accounts, filters, total, view }: PostsToolbarProps) {
  const compact = usePageScrollCompact()
  const { isPending, applyFilters, clearFilters, setView } = usePostFilters()
  const fields = useMemo(() => buildPostFilterFields(accounts), [accounts])
  const hasFilters = hasActivePostFilters(filters)
  const filterCount = filters.length
  const postWord = total === 1 ? 'post' : 'posts'

  return (
    <div
      className={cn(
        'sticky top-0 z-10 -mx-1 flex flex-row items-center justify-between gap-2 px-1',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/60',
        compact ? 'pb-0.5' : 'pb-1',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row flex-nowrap items-center gap-2 overflow-x-auto">
        <Filters
          filters={filters}
          fields={fields}
          onChange={applyFilters}
          size="sm"
          className="gap-1.5"
          trigger={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'shrink-0 gap-1.5 rounded-lg shadow-none',
                compact ? 'h-7' : 'h-8',
                hasFilters && 'text-foreground',
              )}
            >
              <ListFilterIcon className="size-3.5" strokeWidth={1.75} />
              <span className={cn(compact && 'sr-only')}>Filters</span>
              {filterCount > 0 ? (
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full bg-foreground font-medium text-background tabular-nums',
                    compact ? 'size-3.5 text-[9px]' : 'ml-0.5 size-4 text-[10px]',
                  )}
                >
                  {filterCount}
                </span>
              ) : null}
            </Button>
          }
        />

        <DashboardSegment label="Posts view" className="shrink-0">
          {VIEW_OPTIONS.map(option => {
            const selected = view === option.value
            const Icon = option.Icon
            return (
              <DashboardSegmentButton
                key={option.value}
                active={selected}
                onClick={() => setView(option.value)}
                aria-label={option.label}
                className={cn(compact && 'h-6 px-2')}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span className={cn(compact ? 'hidden' : 'hidden sm:inline')}>{option.label}</span>
                <span className={cn(compact ? 'hidden' : 'sm:hidden')}>{option.shortLabel}</span>
              </DashboardSegmentButton>
            )
          })}
        </DashboardSegment>
      </div>

      <div className="flex shrink-0 flex-row items-center gap-2 text-[12px] text-muted-foreground">
        {isPending ? <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> : null}
        <span className="tabular-nums tracking-tight">
          <span className="font-medium text-foreground">{total.toLocaleString()}</span>
          <span className={cn(compact && 'hidden sm:inline')}>{` ${postWord}`}</span>
        </span>
        {hasFilters ? (
          <>
            <span aria-hidden className="text-border">
              ·
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-foreground/80 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear filters
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
