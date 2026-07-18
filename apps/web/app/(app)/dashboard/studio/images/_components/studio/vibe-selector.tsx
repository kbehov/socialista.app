'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { VIBE_IDS, VIBE_LABELS, type VibeId } from '@/lib/studio/images/examples'

type VibeSelectorProps = {
  value: VibeId
  onChange: (vibe: VibeId) => void
  className?: string
  size?: 'sm' | 'md'
}

export function VibeSelector({ value, onChange, className, size = 'md' }: VibeSelectorProps) {
  const reduceMotion = useReducedMotion()
  const isSm = size === 'sm'

  return (
    <div
      className={cn(
        'flex gap-0.5 overflow-x-auto rounded-lg bg-muted/25 p-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
        className,
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
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.3 }}
            className={cn(
              'shrink-0 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              isSm ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {VIBE_LABELS[vibe]}
          </motion.button>
        )
      })}
    </div>
  )
}
