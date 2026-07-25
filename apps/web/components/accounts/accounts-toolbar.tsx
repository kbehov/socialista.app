'use client'

import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAccountFilters } from '@/hooks/use-account-filters'
import { useAccountSearch } from '@/hooks/use-account-search'
import {
  buildAccountFilterFields,
  hasActiveAccountFilters,
} from '@/lib/account-filters'
import { cn } from '@/lib/utils'
import { ListFilterIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type AccountsToolbarProps = {
  total: number
  initialQuery?: string
  filters: Filter<string>[]
  className?: string
}

export function AccountsToolbar({
  total,
  initialQuery = '',
  filters,
  className,
}: AccountsToolbarProps) {
  const { isPending: isSearchPending, setSearchQuery, clearSearch } = useAccountSearch()
  const { isPending: isFiltersPending, applyFilters, clearFilters } = useAccountFilters()
  const [value, setValue] = useState(initialQuery)
  const fields = useMemo(() => buildAccountFilterFields(), [])
  const hasFilters = hasActiveAccountFilters(filters)
  const isPending = isSearchPending || isFiltersPending

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
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        isPending && 'pointer-events-none opacity-60',
        className,
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          <span className="tabular-nums">
            {total} {total === 1 ? 'account' : 'accounts'}
            {initialQuery ? ` matching “${initialQuery}”` : ''}
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

      <div className="relative w-full sm:max-w-xs">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Search by name, handle, or ID…"
          className="h-9 border-border/60 bg-background pr-8 pl-8 text-sm shadow-none"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
            onClick={() => {
              setValue('')
              clearSearch()
            }}
            aria-label="Clear search"
          >
            <XIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
