'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'
import { VIBE_IDS, VIBE_LABELS, type VibeId } from '../_lib/examples'

type VibeSelectorProps = {
  value: VibeId
  onChange: (vibe: VibeId) => void
  className?: string
  size?: 'sm' | 'md'
}

export function VibeSelector({ value, onChange, className, size = 'md' }: VibeSelectorProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
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
              'shrink-0 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]',
              isSelected
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {VIBE_LABELS[vibe]}
          </motion.button>
        )
      })}
    </div>
  )
}
