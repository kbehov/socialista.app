'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useSkillsSearch } from '@/hooks/use-skills-search'
import { cn } from '@/lib/utils'
import { Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 300

type SkillsSearchProps = {
  initialQuery: string
  resultCount?: number
  variant?: 'default' | 'compact' | 'full'
}

export function SkillsSearch({
  initialQuery,
  resultCount = 0,
  variant = 'full',
}: SkillsSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isPending, setSearchQuery, clearSearch } = useSkillsSearch()
  const [value, setValue] = useState(initialQuery)
  const trimmedValue = value.trim()
  const showClear = Boolean(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setValue(initialQuery)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [initialQuery])

  useEffect(() => {
    if (trimmedValue === initialQuery) return

    const timeout = window.setTimeout(() => {
      setSearchQuery(trimmedValue)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [trimmedValue, initialQuery, setSearchQuery])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null
        if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
        event.preventDefault()
        inputRef.current?.focus()
        return
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current && value) {
        event.preventDefault()
        setValue('')
        clearSearch()
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSearch, value])

  const resultLabel = resultCount === 1 ? 'skill' : 'skills'

  const inputClassName = cn(
    'h-10 w-full min-w-0 bg-muted/35 pr-10 pl-9 text-[13px] text-foreground outline-none',
    'placeholder:text-muted-foreground/55',
    'rounded-lg border-0 shadow-none',
    'transition-[background-color,box-shadow] duration-150',
    'focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/20',
  )

  if (variant === 'full') {
    return (
      <div className={cn('w-full space-y-2 pt-0.5', isPending && 'pointer-events-none opacity-70')}>
        <div className="group relative w-full">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/60"
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            id="skills-search"
            name="q"
            type="search"
            value={value}
            onChange={event => setValue(event.target.value)}
            placeholder="Search skills by name or path…"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Search skills"
            className={inputClassName}
          />
          <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
            {isPending ? (
              <Loader2Icon className="size-3.5 animate-spin text-muted-foreground/60" aria-hidden />
            ) : showClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="pointer-events-auto size-7 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setValue('')
                  clearSearch()
                  inputRef.current?.focus()
                }}
                aria-label="Clear search"
              >
                <XIcon className="size-3.5" />
              </Button>
            ) : (
              <Kbd className="border-0 bg-transparent text-[11px] text-muted-foreground/50 group-focus-within:opacity-0">
                /
              </Kbd>
            )}
          </div>
        </div>

        <p className="text-[12px] text-muted-foreground/80">
          <span className="font-medium tabular-nums text-foreground/75">{resultCount.toLocaleString('en-US')}</span>{' '}
          {resultLabel}
          {initialQuery ? (
            <>
              {' '}
              matching <span className="text-foreground/75">“{initialQuery}”</span>
            </>
          ) : null}
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('relative w-full', isPending && 'pointer-events-none opacity-70')}>
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/60"
          strokeWidth={1.75}
        />
        <input
          ref={inputRef}
          id="skills-search"
          name="q"
          type="search"
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Search..."
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Search skills"
          className={inputClassName}
        />
        <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin text-muted-foreground/60" aria-hidden />
          ) : showClear ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="pointer-events-auto size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => {
                setValue('')
                clearSearch()
                inputRef.current?.focus()
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

  return (
    <div
      className={cn(
        'flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        isPending && 'pointer-events-none',
      )}
    >
      <div className="group relative min-w-0 flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground/70"
          strokeWidth={1.75}
        />
        <input
          ref={inputRef}
          id="skills-search"
          name="q"
          type="search"
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Search skills by name or path…"
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Search skills"
          className={cn(
            'h-10 w-full border-0 bg-transparent pr-16 pl-7 text-sm text-foreground outline-none shadow-none',
            'placeholder:text-muted-foreground/60 focus-visible:ring-0',
          )}
        />
        <div className="pointer-events-none absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1.5">
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin text-muted-foreground/70" aria-hidden />
          ) : showClear ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="pointer-events-auto size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => {
                setValue('')
                clearSearch()
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </Button>
          ) : (
            <Kbd className="border-0 bg-transparent text-[11px] text-muted-foreground/50 group-focus-within:opacity-0">
              /
            </Kbd>
          )}
        </div>
      </div>

      <p className="shrink-0 text-[12px] text-muted-foreground sm:text-right">
        <span className="font-medium tabular-nums text-foreground/80">{resultCount.toLocaleString('en-US')}</span>{' '}
        {resultLabel}
        {initialQuery ? (
          <>
            {' '}
            matching <span className="text-foreground/80">“{initialQuery}”</span>
          </>
        ) : null}
      </p>
    </div>
  )
}
