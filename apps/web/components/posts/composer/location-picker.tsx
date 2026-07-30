'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { searchAccountLocations } from '@/services/account.service'
import type { LocationSearchResult } from '@socialista/types'
import { Loader2Icon, MapPinIcon, RotateCcwIcon } from 'lucide-react'
import { useEffect, useId, useState, useTransition } from 'react'

type LocationValue = { id: string; name: string } | null

type LocationPickerProps = {
  accountId: string
  value: LocationValue
  onChange: (location: LocationValue) => void
  className?: string
}

export function LocationPicker({ accountId, value, onChange, className }: LocationPickerProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const trimmedQuery = query.trim()
  const canSearch = open && trimmedQuery.length >= 2

  useEffect(() => {
    if (!canSearch) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const response = await searchAccountLocations(accountId, trimmedQuery)
          if (cancelled) return
          setResults(response.data?.locations ?? [])
          setError(null)
        } catch (err) {
          if (cancelled) return
          setResults([])
          setError(err instanceof Error ? err.message : 'Location search failed')
        }
      })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [accountId, canSearch, trimmedQuery])

  const showResults = canSearch ? results : []
  const showLoading = canSearch && isPending
  const showError = canSearch && error && !isPending

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Location</span>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
            onClick={() => onChange(null)}
          >
            <RotateCcwIcon className="size-3" strokeWidth={1.75} />
            Clear
          </Button>
        ) : null}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            className={cn(
              'h-9 w-full justify-start gap-2 rounded-xl border-border/60 px-3 text-sm font-normal shadow-xs',
              !value && 'text-muted-foreground',
            )}
          >
            <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="truncate">{value?.name ?? 'Search for a location…'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command shouldFilter={false} id={listId}>
            <CommandInput
              placeholder="Search places…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {showLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                  <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
                  Searching…
                </div>
              ) : null}
              {showError ? (
                <div className="px-3 py-4 text-center text-xs text-destructive">{error}</div>
              ) : null}
              {!showLoading && !showError && canSearch ? (
                <CommandEmpty>No locations found.</CommandEmpty>
              ) : null}
              {!canSearch ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              ) : null}
              {showResults.length > 0 ? (
                <CommandGroup>
                  {showResults.map(location => {
                    const subtitle = [location.city, location.country].filter(Boolean).join(', ')
                    return (
                      <CommandItem
                        key={location.id}
                        value={location.id}
                        onSelect={() => {
                          onChange({ id: location.id, name: location.name })
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <MapPinIcon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                        <div className="min-w-0">
                          <p className="truncate text-sm">{location.name}</p>
                          {subtitle ? (
                            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
                          ) : null}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
