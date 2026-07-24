'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAccountSearch } from '@/hooks/use-account-search'
import { cn } from '@/lib/utils'
import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type AccountsToolbarProps = {
  total: number
  initialQuery?: string
  className?: string
}

export function AccountsToolbar({ total, initialQuery = '', className }: AccountsToolbarProps) {
  const { isPending, setSearchQuery, clearSearch } = useAccountSearch()
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    setValue(initialQuery)
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
        isPending && 'opacity-80',
        className,
      )}
    >
      <p className="text-xs tabular-nums text-muted-foreground">
        {total} {total === 1 ? 'account' : 'accounts'}
        {initialQuery ? ` matching “${initialQuery}”` : ''}
      </p>

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
