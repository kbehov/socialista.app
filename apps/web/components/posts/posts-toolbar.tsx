'use client'

import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { usePostFilters } from '@/hooks/use-post-filters'
import {
  buildPostFilterFields,
  hasActivePostFilters,
  type PostViewMode,
} from '@/lib/post-filters'
import { cn } from '@/lib/utils'
import type { AccountSummary } from '@socialista/types'
import { CalendarDaysIcon, LayoutListIcon, ListFilterIcon, Loader2Icon } from 'lucide-react'
import { useMemo } from 'react'

const VIEW_OPTIONS: Array<{
  value: PostViewMode
  label: string
  shortLabel: string
  Icon: typeof LayoutListIcon
}> = [
  { value: 'list', label: 'List', shortLabel: 'List', Icon: LayoutListIcon },
  { value: 'calendar', label: 'Calendar', shortLabel: 'Cal', Icon: CalendarDaysIcon },
]

type PostsToolbarProps = {
  accounts: AccountSummary[]
  filters: Filter<string>[]
  total: number
  view: PostViewMode
}

export function PostsToolbar({ accounts, filters, total, view }: PostsToolbarProps) {
  const { isPending, applyFilters, clearFilters, setView } = usePostFilters()
  const fields = useMemo(() => buildPostFilterFields(accounts), [accounts])
  const hasFilters = hasActivePostFilters(filters)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
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

        <div className="inline-flex rounded-full border border-border/50 bg-background p-0.5">
          {VIEW_OPTIONS.map(option => {
            const selected = view === option.value
            const Icon = option.Icon
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/40'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
        <span className="tabular-nums">
          {total} {total === 1 ? 'post' : 'posts'}
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
              Clear filters
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
