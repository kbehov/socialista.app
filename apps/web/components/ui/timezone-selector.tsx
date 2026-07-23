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
import {
  COMMON_TIMEZONE_VALUES,
  formatTimezoneLabel,
  formatTimezoneLocalTime,
  formatTimezoneOffset,
  getTimezoneOptions,
  groupTimezonesByRegion,
  type TimezoneOption,
} from '@/lib/timezone'
import { cn } from '@/lib/utils'
import { ChevronsUpDownIcon, GlobeIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

type TimezoneSelectorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  /** `popover` floats in a portal; `inline` expands in document flow (better inside dialogs). */
  mode?: 'popover' | 'inline'
  /** Start with the list open — useful with `inline` mode in forms. */
  defaultOpen?: boolean
}

function TimezoneOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: TimezoneOption
  selected: boolean
  onSelect: () => void
}) {
  const now = useMemo(() => new Date(), [])

  return (
    <CommandItem value={option.searchValue} onSelect={onSelect} data-checked={selected}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{option.city}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {option.value} · {formatTimezoneOffset(option.value, now)}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatTimezoneLocalTime(option.value, now)}
      </span>
    </CommandItem>
  )
}

function TimezoneList({
  value,
  onSelect,
  listClassName,
}: {
  value: string
  onSelect: (timezone: string) => void
  listClassName?: string
}) {
  const allOptions = useMemo(() => getTimezoneOptions(), [])
  const commonOptions = useMemo(
    () =>
      COMMON_TIMEZONE_VALUES.map(
        timezone => allOptions.find(option => option.value === timezone) ?? null,
      ).filter((option): option is TimezoneOption => option !== null),
    [allOptions],
  )
  const groupedOptions = useMemo(() => {
    const commonSet = new Set<string>(COMMON_TIMEZONE_VALUES)
    return groupTimezonesByRegion(allOptions.filter(option => !commonSet.has(option.value)))
  }, [allOptions])

  return (
    <Command className="flex min-h-0 flex-1 flex-col rounded-none bg-transparent">
      <CommandInput placeholder="Search city or timezone…" />
      <CommandList className={cn('min-h-0 flex-1 overflow-y-auto', listClassName)}>
        <CommandEmpty>No timezone found.</CommandEmpty>

        <CommandGroup heading="Common">
          {commonOptions.map(option => (
            <TimezoneOptionRow
              key={option.value}
              option={option}
              selected={value === option.value}
              onSelect={() => onSelect(option.value)}
            />
          ))}
        </CommandGroup>

        {groupedOptions.map(({ region, options }) => (
          <CommandGroup key={region} heading={region}>
            {options.map(option => (
              <TimezoneOptionRow
                key={option.value}
                option={option}
                selected={value === option.value}
                onSelect={() => onSelect(option.value)}
              />
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

export function TimezoneSelector({
  value,
  onChange,
  disabled,
  className,
  id,
  'aria-label': ariaLabel = 'Timezone',
  mode = 'popover',
  defaultOpen = false,
}: TimezoneSelectorProps) {
  const [open, setOpen] = useState(defaultOpen)
  const now = useMemo(() => new Date(), [])
  const isInline = mode === 'inline'

  const selectedLabel = value ? formatTimezoneLabel(value, now) : 'Select timezone'

  const handleSelect = (timezone: string) => {
    onChange(timezone)
    if (!isInline) setOpen(false)
  }

  const triggerButton = (
    <Button
      id={id}
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'h-9 w-full shrink-0 justify-between rounded-lg px-3 font-normal shadow-xs',
        'hover:bg-background',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <span className="truncate text-sm">{selectedLabel}</span>
      </span>
      <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
    </Button>
  )

  if (isInline) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'h-9 w-full shrink-0 justify-between rounded-lg px-3 font-normal shadow-xs',
            'hover:bg-background',
          )}
          onClick={() => setOpen(current => !current)}
        >
          <span className="flex min-w-0 items-center gap-2">
            <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="truncate text-sm">{selectedLabel}</span>
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </Button>

        {open ? (
          <div className="mt-2 flex min-h-[min(320px,42vh)] flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-popover shadow-xs ring-1 ring-foreground/5">
            <TimezoneList
              value={value}
              onSelect={handleSelect}
              listClassName="max-h-none"
            />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('w-full', className)}>
        <PopoverTrigger asChild disabled={disabled}>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent className="flex max-h-72 min-w-[min(100vw-2rem,20rem)] flex-col">
          <TimezoneList value={value} onSelect={handleSelect} listClassName="max-h-64" />
        </PopoverContent>
      </div>
    </Popover>
  )
}
