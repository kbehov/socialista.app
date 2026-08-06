'use client'

import { cn } from '@/lib/utils'
import type { ChoiceOption, SwatchOption } from '@/lib/studio/influencers/options'
import { CheckIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

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
        'relative flex flex-wrap gap-0.5 rounded-xl bg-muted/25 p-1 ring-1 ring-border/35',
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
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
            className={cn(
              'relative min-h-8 flex-1 rounded-lg px-3 text-[13px] font-medium tracking-[-0.015em]',
              'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/85',
            )}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border/45"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', bounce: 0, duration: 0.32 }
                }
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
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2.5">
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
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
            className={cn(
              'group relative flex size-10 items-center justify-center rounded-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'ring-1 ring-border/40',
            )}
          >
            <span
              className={cn(
                'size-7 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] transition-transform duration-150',
                !selected && 'group-hover:scale-105',
              )}
              style={{ backgroundColor: option.color }}
            />
            {selected ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-4 items-center justify-center rounded-full bg-black/35 backdrop-blur-[1px]">
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
}

export function ChipSingleSelect({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: ChipSingleProps) {
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
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.015em]',
              'ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              selected
                ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
            )}
          >
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}

type ChipMultiProps = {
  values: string[]
  options: ReadonlyArray<ChoiceOption>
  onChange: (values: string[]) => void
  'aria-label': string
  max?: number
}

export function ChipMultiSelect({
  values,
  options,
  onChange,
  'aria-label': ariaLabel,
  max,
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
        return (
          <motion.button
            key={option.id}
            type="button"
            aria-pressed={selected}
            disabled={atMax}
            onClick={() => toggle(option.id)}
            whileTap={reduceMotion || atMax ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.015em]',
              'ring-1 transition-[background-color,color,box-shadow,ring-color,opacity] duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              selected
                ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
              atMax && 'cursor-not-allowed opacity-40 hover:bg-muted/25 hover:text-muted-foreground hover:ring-border/30',
            )}
          >
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
}

export function ChoiceGrid({ value, options, onChange, 'aria-label': ariaLabel }: ChoiceGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map(option => {
        const selected = option.id === value
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
            className={cn(
              'rounded-xl px-3.5 py-3 text-left transition-[background-color,box-shadow,ring-color] duration-150',
              'ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              selected
                ? 'bg-foreground/[0.05] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-foreground/20'
                : 'bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground hover:ring-border/45',
            )}
          >
            <span className="block text-[13px] font-medium tracking-[-0.015em] text-foreground">
              {option.label}
            </span>
            {option.description ? (
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
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
}: {
  children: React.ReactNode
  htmlFor?: string
  hint?: string
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium tracking-[-0.01em] text-foreground/90"
      >
        {children}
      </label>
      {hint ? <span className="shrink-0 text-[12px] text-muted-foreground">{hint}</span> : null}
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
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[11px] font-semibold tabular-nums tracking-tight text-muted-foreground ring-1 ring-border/40"
          >
            {step}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-foreground">{title}</h2>
          {description ? (
            <p className="text-[13px] leading-[1.5] text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className={step !== undefined ? 'pl-9 sm:pl-9' : undefined}>{children}</div>
    </section>
  )
}
