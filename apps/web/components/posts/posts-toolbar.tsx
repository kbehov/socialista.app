'use client'

import { DashboardSegment } from '@/components/dashboard/dashboard-segment'
import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { usePostFilters } from '@/hooks/use-post-filters'
import { buildPostFilterFields, hasActivePostFilters, type PostViewMode } from '@/lib/posts/post-filters'
import { cn } from '@/lib/utils'
import type { AccountSummary } from '@socialista/types'
import { CalendarDaysIcon, LayoutGridIcon, ListFilterIcon, Loader2Icon, XIcon } from 'lucide-react'
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

  return (
    <div
      className={cn(
        'sticky top-0 z-10 -mx-1 flex flex-row items-center justify-between gap-2 px-1',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/60',
        'transition-[padding] duration-200 ease-out',
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
          className={cn('gap-1.5', compact && 'gap-1')}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'shrink-0 gap-1.5 rounded-full  shadow-none',
                'hover:bg-muted/40',
                'transition-[height,padding] duration-200 ease-out',
                compact ? 'h-7 px-2.5' : 'h-8 px-3 text-xs',
                hasFilters && 'text-foreground',
              )}
            >
              <ListFilterIcon className="size-3.5" strokeWidth={1.75} />
              <span className={cn(compact && 'sr-only')}>Filters</span>
              {filterCount > 0 ? (
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full bg-foreground font-semibold text-background tabular-nums',
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
              <Button
                key={option.value}
                variant={selected ? 'ghost' : 'ghost'}
                size={compact ? 'icon-xs' : 'sm'}
                onClick={() => setView(option.value)}
                className={cn(
                  ' transition-[height,padding] duration-200 ease-out text-muted-foreground text-xs',
                  compact ? 'h-6 px-2' : 'h-7 px-2.5',
                  selected && 'text-foreground',
                )}
                aria-label={option.label}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span className={cn(compact ? 'hidden' : 'hidden sm:inline')}>{option.label}</span>
                <span className={cn(compact ? 'hidden' : 'sm:hidden')}>{option.shortLabel}</span>
              </Button>
            )
          })}
        </DashboardSegment>
      </div>

      <div
        className={cn(
          'flex shrink-0 flex-row items-center gap-2 text-muted-foreground',
          compact ? 'text-[11px]' : 'gap-2.5 text-[12px]',
        )}
      >
        {isPending ? <Loader2Icon className="size-3.5 animate-spin text-muted-foreground/70" aria-hidden /> : null}
        <span className={cn('tabular-nums tracking-tight', compact && 'hidden sm:inline')}>
          <span className="font-medium text-foreground/80">{total.toLocaleString()}</span>
          {compact ? '' : ` ${total === 1 ? 'post' : 'posts'}`}
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/25',
              'font-medium text-muted-foreground',
              'transition-[color,background-color,padding,height] duration-200 ease-out',
              'hover:border-border hover:bg-muted/45 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'active:scale-[0.97]',
              compact ? 'size-7 justify-center p-0' : 'px-2 py-0.5 text-[11px]',
            )}
            aria-label="Clear filters"
          >
            <XIcon className="size-3" strokeWidth={2} />
            <span className={cn(compact && 'sr-only')}>Clear</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
