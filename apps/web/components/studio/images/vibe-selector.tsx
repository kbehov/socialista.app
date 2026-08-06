'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { VIBE_IDS, VIBE_LABELS, type VibeId } from '@/lib/studio/images/examples'

type VibeSelectorProps = {
  value: VibeId
  onChange: (vibe: VibeId) => void
  className?: string
  size?: 'sm' | 'md'
  variant?: 'segmented' | 'pills'
}

export function VibeSelector({
  value,
  onChange,
  className,
  size = 'md',
  variant = 'segmented',
}: VibeSelectorProps) {
  const reduceMotion = useReducedMotion()
  const isSm = size === 'sm'

  if (variant === 'pills') {
    return (
      <div className={cn('relative', className)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-linear-to-r from-background to-transparent sm:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-linear-to-l from-background to-transparent sm:hidden"
        />

        <div
          className={cn(
            'flex gap-2 overflow-x-auto py-0.5',
            '[-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
          )}
          role="tablist"
          aria-label="Filter by vibe"
        >
          {VIBE_IDS.map(vibe => {
            const isSelected = value === vibe
            const label = vibe === 'all' ? 'All' : VIBE_LABELS[vibe]

            return (
              <motion.button
                key={vibe}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onChange(vibe)}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
                className={cn(
                  'shrink-0 rounded-full font-medium tracking-[-0.015em]',
                  'ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                  isSm ? 'h-7 px-3 text-xs' : 'h-8 px-3.5 text-[13px]',
                  isSelected
                    ? 'bg-foreground/8 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-border/50'
                    : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground/90 hover:ring-border/45',
                )}
              >
                <span className="whitespace-nowrap">{label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 rounded-l-xl bg-linear-to-r from-muted/30 to-transparent sm:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 rounded-r-xl bg-linear-to-l from-muted/30 to-transparent sm:hidden"
      />

      <div
        className={cn(
          'relative flex gap-0.5 overflow-x-auto rounded-xl bg-muted/25 p-1',
          '[-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
          'ring-1 ring-border/35',
        )}
        role="tablist"
        aria-label="Filter by vibe"
      >
        {VIBE_IDS.map(vibe => {
          const isSelected = value === vibe

          return (
            <motion.button
              key={vibe}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(vibe)}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
              className={cn(
                'relative shrink-0 rounded-lg font-medium tracking-[-0.015em]',
                'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                isSm ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
                isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/85',
              )}
            >
              {isSelected ? (
                <motion.span
                  layoutId="image-studio-vibe-indicator"
                  className="absolute inset-0 rounded-lg bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border/45"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }
                  }
                />
              ) : null}
              <span className="relative z-10 whitespace-nowrap">{VIBE_LABELS[vibe]}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
