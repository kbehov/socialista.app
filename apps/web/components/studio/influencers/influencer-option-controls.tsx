'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import type { ChoiceOption, SwatchOption } from '@/lib/studio/influencers/options'
import {
  getOptionIcon,
  OptionIcon,
  FieldIcon,
  type OptionIconGroup,
  WIZARD_STEP_ICONS,
} from '@/lib/studio/influencers/option-icons'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

const TAP_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.28 }
const LAYOUT_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.32 }

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
  layoutId = 'influencer-segment-indicator',
}: SegmentedProps<T>) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'relative flex flex-wrap gap-0.5 rounded-xl bg-muted/20 p-1 ring-1 ring-border/30',
        className,
      )}
    >
      {options.map(option => {
        const selected = option.id === value
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
            className={cn(
              'relative min-h-9 flex-1 rounded-[10px] px-2.5 text-[13px] font-medium tracking-[-0.015em] sm:px-3',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/85',
            )}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[10px] bg-background shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-border/40"
                transition={reduceMotion ? { duration: 0 } : LAYOUT_SPRING}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
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
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
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
              'group relative flex size-11 items-center justify-center rounded-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected
                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                : 'ring-1 ring-border/35 hover:ring-border/55',
            )}
          >
            <span
              className={cn(
                'size-7.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.14)] transition-transform duration-150',
                !selected && 'group-hover:scale-105',
              )}
              style={{ backgroundColor: option.color }}
            />
            {selected ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-4.5 items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]">
                  <CheckIcon className="size-2.5 text-white" strokeWidth={2.5} />
                </span>
              </span>
            ) : null}
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
  const reduceMotion = useReducedMotion()

  const renderChip = (option: ChoiceOption) => {
    const selected = option.id === value
    const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
    return (
      <motion.button
        key={option.id}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onChange(option.id)}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em]',
          'ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          selected
            ? 'bg-foreground text-background shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-foreground'
            : 'bg-muted/20 text-muted-foreground ring-border/25 hover:bg-muted/35 hover:text-foreground hover:ring-border/40',
        )}
      >
        <OptionIcon icon={Icon} selected={selected} />
        {option.label}
      </motion.button>
    )
  }

  if (!options.some(o => o.group)) {
    return (
      <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
        {options.map(renderChip)}
      </div>
    )
  }

  const groups: Array<{ label?: string; options: ChoiceOption[] }> = []
  for (const option of options) {
    const last = groups[groups.length - 1]
    if (last && last.label === option.group) {
      last.options.push(option)
    } else {
      groups.push({ label: option.group, options: [option] })
    }
  }

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-3">
      {groups.map(group => (
        <div key={group.label ?? 'ungrouped'}>
          {group.label ? (
            <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground/70 uppercase">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">{group.options.map(renderChip)}</div>
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
  const reduceMotion = useReducedMotion()

  function toggle(id: string) {
    if (values.includes(id)) {
      onChange(values.filter(v => v !== id))
      return
    }
    if (max !== undefined && values.length >= max) return
    onChange([...values, id])
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map(option => {
        const selected = values.includes(option.id)
        const atMax = max !== undefined && values.length >= max && !selected
        const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
        return (
          <motion.button
            key={option.id}
            type="button"
            aria-pressed={selected}
            disabled={atMax}
            onClick={() => toggle(option.id)}
            whileTap={reduceMotion || atMax ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em]',
              'ring-1 transition-[background-color,color,box-shadow,ring-color,opacity] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              selected
                ? 'bg-foreground text-background shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-foreground'
                : 'bg-muted/20 text-muted-foreground ring-border/25 hover:bg-muted/35 hover:text-foreground hover:ring-border/40',
              atMax && 'cursor-not-allowed opacity-40 hover:bg-muted/20 hover:text-muted-foreground hover:ring-border/25',
            )}
          >
            <OptionIcon icon={Icon} selected={selected} />
            {option.label}
          </motion.button>
        )
      })}
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
  const reduceMotion = useReducedMotion()

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map(option => {
        const selected = option.id === value
        const Icon = iconGroup ? getOptionIcon(iconGroup, option.id) : undefined
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
            className={cn(
              'rounded-xl px-3.5 py-3.5 text-left transition-[background-color,box-shadow,ring-color] duration-150',
              'ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              selected
                ? 'bg-foreground/[0.04] text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-foreground/25'
                : 'bg-muted/15 text-muted-foreground ring-border/25 hover:bg-muted/30 hover:text-foreground hover:ring-border/40',
            )}
          >
            <span className="flex items-center gap-2">
              {Icon ? (
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md',
                    selected ? 'bg-foreground/10' : 'bg-muted/40',
                  )}
                >
                  <OptionIcon icon={Icon} selected={false} className="text-foreground/70" />
                </span>
              ) : null}
              <span className="block text-[13px] font-medium tracking-[-0.015em] text-foreground">
                {option.label}
              </span>
            </span>
            {option.description ? (
              <span
                className={cn(
                  'mt-1.5 block text-xs leading-relaxed text-muted-foreground',
                  Icon && 'pl-8',
                )}
              >
                {option.description}
              </span>
            ) : null}
          </motion.button>
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
  children: React.ReactNode
  htmlFor?: string
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.01em] text-foreground/90"
      >
        {icon ? <FieldIcon icon={icon} /> : null}
        {children}
      </label>
      {hint ? <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

export function FormSection({
  title,
  description,
  step,
  children,
}: {
  title: string
  description?: string
  step?: number
  children: React.ReactNode
}) {
  return (
    <section className="scroll-mt-24 space-y-5">
      <div className="flex items-start gap-3.5">
        {step !== undefined ? (
          <span
            aria-hidden
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/40 text-[11px] font-semibold tabular-nums tracking-tight text-muted-foreground ring-1 ring-border/35"
          >
            {step}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-foreground">{title}</h2>
          {description ? (
            <p className="text-[13px] leading-[1.55] text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className={step !== undefined ? 'pl-9 sm:pl-9' : undefined}>{children}</div>
    </section>
  )
}

/** Vertical stack of fields with separators between groups. */
export function FormFieldStack({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children]
  return (
    <div className={cn('space-y-5', className)}>
      {items.map((child, index) => (
        <div key={index}>
          {index > 0 ? <Separator className="mb-5 bg-border/40" /> : null}
          {child}
        </div>
      ))}
    </div>
  )
}

export const WIZARD_STEPS = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Appearance' },
  { id: 3, label: 'Style' },
  { id: 4, label: 'Review' },
] as const

type WizardProgressProps = {
  current: number
  onJump: (step: number) => void
  className?: string
}

export function WizardProgress({ current, onJump, className }: WizardProgressProps) {
  const reduceMotion = useReducedMotion()

  return (
    <nav
      aria-label="Creation progress"
      className={cn(
        'relative flex flex-wrap gap-0.5 rounded-xl bg-muted/20 p-1 ring-1 ring-border/30',
        className,
      )}
    >
      {WIZARD_STEPS.map(step => {
        const selected = step.id === current
        const completed = step.id < current
        const clickable = completed
        const StepIcon = WIZARD_STEP_ICONS[step.id]

        return (
          <motion.button
            key={step.id}
            type="button"
            disabled={!clickable && !selected}
            onClick={() => {
              if (clickable) onJump(step.id)
            }}
            whileTap={reduceMotion || !clickable ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
            className={cn(
              'relative min-h-9 flex-1 rounded-[10px] px-2 text-[12px] font-medium tracking-[-0.015em] sm:px-3 sm:text-[13px]',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              selected
                ? 'text-foreground'
                : completed
                  ? 'cursor-pointer text-muted-foreground hover:text-foreground/85'
                  : 'cursor-default text-muted-foreground/50',
            )}
            aria-current={selected ? 'step' : undefined}
          >
            {selected ? (
              <motion.span
                layoutId="influencer-wizard-progress"
                className="absolute inset-0 rounded-[10px] bg-background shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-border/40"
                transition={reduceMotion ? { duration: 0 } : LAYOUT_SPRING}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  selected
                    ? 'bg-foreground text-background'
                    : completed
                      ? 'bg-foreground/10 text-foreground'
                      : 'bg-muted/50 text-muted-foreground/60',
                )}
              >
                {completed ? (
                  <CheckIcon className="size-2.5" strokeWidth={2.5} />
                ) : StepIcon ? (
                  <StepIcon className="size-2.5" strokeWidth={1.75} />
                ) : (
                  step.id
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}

type AdvancedCollapsibleProps = {
  label?: string
  icon?: LucideIcon
  children: React.ReactNode
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
          className={cn(
            'group flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left',
            'bg-muted/12 ring-1 ring-border/30 transition-[background-color,box-shadow,ring-color] duration-150',
            'hover:bg-muted/20 hover:ring-border/45',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            open && 'bg-muted/18 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] ring-border/40',
          )}
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.015em] text-foreground">
            {icon ? <FieldIcon icon={icon} className="size-6" /> : null}
            {label}
          </span>
          <ChevronDownIcon
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground/65 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 data-[state=closed]:animate-none">
          <div className="space-y-6">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
