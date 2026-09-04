'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ChoiceOption, SwatchOption } from '@/lib/studio/influencers/options'
import {
  getOptionIcon,
  OptionIcon,
  FieldIcon,
  type OptionIconGroup,
} from '@/lib/studio/influencers/option-icons'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ChevronDownIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'

const TAP_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.28 }

const CHIP = cn(
  'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium tracking-[-0.01em]',
  'border transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
  'active:scale-[0.98] motion-reduce:active:scale-100',
)

const CHIP_ON = 'border-transparent bg-foreground text-background'
const CHIP_OFF = cn(
  'border-border/55 bg-background text-muted-foreground',
  'hover:border-border hover:bg-muted/40 hover:text-foreground',
  'dark:border-border/70',
)
const CHIP_DISABLED = 'cursor-not-allowed opacity-40 hover:border-border/55 hover:bg-background hover:text-muted-foreground'

function groupOptions(options: ReadonlyArray<ChoiceOption>) {
  if (!options.some(option => option.group)) return null

  const groups: Array<{ label?: string; options: ChoiceOption[] }> = []
  const indexByLabel = new Map<string | undefined, number>()
  for (const option of options) {
    const label = option.group
    const existing = indexByLabel.get(label)
    if (existing !== undefined) {
      groups[existing]!.options.push(option)
      continue
    }
    indexByLabel.set(label, groups.length)
    groups.push({ label, options: [option] })
  }
  return groups
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{children}</p>
}

type SegmentedProps<T extends string> = {
  value: T
  options: ReadonlyArray<{ id: T; label: string }>
  onChange: (value: T) => void
  className?: string
  'aria-label': string
  layoutId?: string
}

export function OptionSegmented<T extends string>({
  value,
  options,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(dashboardSurface.segment, 'flex w-full min-w-0', className)}
    >
      {options.map(option => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              dashboardSurface.segmentItem,
              'inline-flex h-7 min-w-0 flex-1 items-center justify-center px-2',
              selected ? dashboardSurface.segmentItemActive : dashboardSurface.segmentItemInactive,
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

type SwatchPickerProps = {
  value: string
  options: ReadonlyArray<SwatchOption>
  onChange: (value: string) => void
  'aria-label': string
}

export function SwatchPicker({ value, options, onChange, 'aria-label': ariaLabel }: SwatchPickerProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map(option => {
        const selected = option.id === value
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
            className={cn(
              'relative flex size-8 items-center justify-center rounded-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected
                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                : 'ring-1 ring-border/50 hover:ring-border',
            )}
          >
            <span
              className="size-5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: option.color }}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

type ChipSingleProps = {
  value: string
  options: ReadonlyArray<ChoiceOption>
  onChange: (value: string) => void
  'aria-label': string
  iconGroup?: OptionIconGroup
}

export function ChipSingleSelect({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  iconGroup,
}: ChipSingleProps) {
  const renderChip = (option: ChoiceOption) => {
    const selected = option.id === value
    const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
    return (
      <button
        key={option.id}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onChange(option.id)}
        className={cn(CHIP, selected ? CHIP_ON : CHIP_OFF)}
      >
        <OptionIcon icon={Icon} selected={selected} />
        {option.label}
      </button>
    )
  }

  const groups = groupOptions(options)
  if (!groups) {
    return (
      <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
        {options.map(renderChip)}
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-3">
      {groups.map(group => (
        <div key={group.label ?? 'ungrouped'}>
          {group.label ? <GroupLabel>{group.label}</GroupLabel> : null}
          <div className="flex flex-wrap gap-1.5">{group.options.map(renderChip)}</div>
        </div>
      ))}
    </div>
  )
}

type ChipMultiProps = {
  values: string[]
  options: ReadonlyArray<ChoiceOption>
  onChange: (values: string[]) => void
  'aria-label': string
  max?: number
  iconGroup?: OptionIconGroup
}

export function ChipMultiSelect({
  values,
  options,
  onChange,
  'aria-label': ariaLabel,
  max,
  iconGroup,
}: ChipMultiProps) {
  function toggle(id: string) {
    if (values.includes(id)) {
      onChange(values.filter(v => v !== id))
      return
    }
    if (max !== undefined && values.length >= max) return
    onChange([...values, id])
  }

  const renderChip = (option: ChoiceOption) => {
    const selected = values.includes(option.id)
    const atMax = max !== undefined && values.length >= max && !selected
    const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
    return (
      <button
        key={option.id}
        type="button"
        aria-pressed={selected}
        disabled={atMax}
        onClick={() => toggle(option.id)}
        className={cn(CHIP, selected ? CHIP_ON : CHIP_OFF, atMax && CHIP_DISABLED)}
      >
        <OptionIcon icon={Icon} selected={selected} />
        {option.label}
      </button>
    )
  }

  const groups = groupOptions(options)
  if (!groups) {
    return (
      <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
        {options.map(renderChip)}
      </div>
    )
  }

  return (
    <div role="group" aria-label={ariaLabel} className="space-y-3">
      {groups.map(group => (
        <div key={group.label ?? 'ungrouped'}>
          {group.label ? <GroupLabel>{group.label}</GroupLabel> : null}
          <div className="flex flex-wrap gap-1.5">{group.options.map(renderChip)}</div>
        </div>
      ))}
    </div>
  )
}

type ChoiceGridProps = {
  value: string
  options: ReadonlyArray<ChoiceOption>
  onChange: (value: string) => void
  'aria-label': string
  iconGroup?: OptionIconGroup
}

export function ChoiceGrid({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  iconGroup,
}: ChoiceGridProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {options.map(option => {
        const selected = option.id === value
        const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-left transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              'active:scale-[0.98] motion-reduce:active:scale-100',
              selected
                ? 'border-border bg-muted/40 text-foreground'
                : 'border-border/55 text-muted-foreground hover:border-border hover:bg-muted/25 hover:text-foreground dark:border-border/70',
            )}
          >
            <span className="flex items-center gap-2">
              {Icon ? <OptionIcon icon={Icon} selected={false} className="text-foreground/55" /> : null}
              <span className="block text-[12px] font-medium tracking-[-0.01em] text-foreground">
                {option.label}
              </span>
            </span>
            {option.description ? (
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                {option.description}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function FieldLabel({
  children,
  htmlFor,
  hint,
  icon,
}: {
  children: ReactNode
  htmlFor?: string
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] text-foreground"
      >
        {icon ? <FieldIcon icon={icon} /> : null}
        {children}
      </label>
      {hint ? (
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/55">{hint}</span>
      ) : null}
    </div>
  )
}

export function PropertyRow({
  label,
  htmlFor,
  hint,
  align = 'start',
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  align?: 'start' | 'center'
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-6',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          align === 'start' && 'sm:min-h-7 sm:items-start sm:pt-0.5',
        )}
      >
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-muted-foreground">
          {label}
        </label>
        {hint ? (
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/55">{hint}</span>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="space-y-0.5">
        <h2 className={dashboardSurface.sectionTitle}>{title}</h2>
        {description ? <p className={dashboardSurface.sectionDescription}>{description}</p> : null}
      </div>
      <div>{children}</div>
    </section>
  )
}

export function FormFieldStack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children]
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {items.map((child, index) => (
        <div key={index}>{child}</div>
      ))}
    </div>
  )
}

export function FormDisclosure({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string
  summary?: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        className={cn(
          'group flex w-full items-center gap-3 px-4 py-3 text-left',
          'transition-colors duration-150 hover:bg-muted/30',
          'focus-visible:outline-none focus-visible:bg-muted/30',
        )}
      >
        <span className="w-auto shrink-0 text-[13px] font-medium text-muted-foreground sm:w-[7rem]">
          {title}
        </span>
        {!open && summary ? (
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/70">{summary}</span>
        ) : (
          <span className="min-w-0 flex-1" />
        )}
        <ChevronDownIcon
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/45 transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150">
        <div className="space-y-5 px-4 pt-0.5 pb-4 sm:pr-4 sm:pl-[calc(1rem+7rem+1.5rem)]">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

type AdvancedCollapsibleProps = {
  label?: string
  icon?: LucideIcon
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function AdvancedCollapsible({
  label = 'Advanced',
  icon,
  children,
  defaultOpen = false,
  className,
}: AdvancedCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          type="button"
          className={cn(
            'group flex w-full items-center gap-1.5 py-1 text-left',
            'text-[12px] font-medium tracking-[-0.01em] text-muted-foreground',
            'transition-colors duration-150 hover:text-foreground',
            'focus-visible:outline-none focus-visible:text-foreground',
            open && 'text-foreground',
          )}
        >
          {icon ? <FieldIcon icon={icon} className="size-4 rounded-[4px] ring-0" /> : null}
          <span>{label}</span>
          <ChevronDownIcon
            className={cn(
              'size-3 shrink-0 text-muted-foreground/65 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden pt-3 data-[state=closed]:animate-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200">
          <div className="space-y-4">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export const chipClassName = { base: CHIP, on: CHIP_ON, off: CHIP_OFF, disabled: CHIP_DISABLED }
