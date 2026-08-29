'use client'

import { dashboardSurface } from '@/components/dashboard'
import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAccountFilters } from '@/hooks/use-account-filters'
import { useAccountSearch } from '@/hooks/use-account-search'
import { buildAccountFilterFields, hasActiveAccountFilters } from '@/lib/accounts/account-filters'
import { cn } from '@/lib/utils'
import { ListFilterIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type AccountsToolbarProps = {
  total: number
  initialQuery?: string
  filters: Filter<string>[]
  className?: string
}

export function AccountsToolbar({ total, initialQuery = '', filters, className }: AccountsToolbarProps) {
  const compact = usePageScrollCompact()
  const { isPending: isSearchPending, setSearchQuery, clearSearch } = useAccountSearch()
  const { isPending: isFiltersPending, applyFilters, clearFilters } = useAccountFilters()
  const [value, setValue] = useState(initialQuery)
  const fields = useMemo(() => buildAccountFilterFields(), [])
  const hasFilters = hasActiveAccountFilters(filters)
  const filterCount = filters.filter(filter => filter.values.length > 0).length
  const isPending = isSearchPending || isFiltersPending
  const accountWord = total === 1 ? 'account' : 'accounts'

  useEffect(() => {
    setTimeout(() => {
      setValue(initialQuery)
    }, 0)
  }, [initialQuery])

  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed === initialQuery) return

    const timeout = window.setTimeout(() => {
      setSearchQuery(trimmed)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [value, initialQuery, setSearchQuery])

  return (
    <div
      className={cn(
        'sticky top-0 z-10 -mx-1 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/60',
        compact ? 'pb-0.5' : 'pb-1',
        isPending && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
              className={cn(dashboardSurface.toolbarControl, 'shrink-0 gap-1.5', hasFilters && 'text-foreground')}
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

        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={value}
            onChange={event => setValue(event.target.value)}
            placeholder="Search accounts…"
            className="h-7 border-border/55 bg-background pr-7 pl-7 text-[13px] shadow-none md:text-[13px] dark:border-border/70 dark:bg-background"
          />
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute top-1/2 right-0.5 size-6 -translate-y-1/2 rounded-md text-muted-foreground"
              onClick={() => {
                setValue('')
                clearSearch()
              }}
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-row items-center gap-2 text-[12px] text-muted-foreground">
        {isPending ? <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> : null}
        <span className="tabular-nums tracking-tight">
          <span className="font-medium text-foreground">{total.toLocaleString()}</span>
          {` ${accountWord}`}
          {initialQuery ? <span className="hidden sm:inline">{` matching “${initialQuery}”`}</span> : null}
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
              Clear
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
