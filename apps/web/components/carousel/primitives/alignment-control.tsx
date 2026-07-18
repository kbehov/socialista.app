'use client'

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react'
import type { TextAlign } from '@socialista/types'
import { cn } from '@/lib/utils'

type AlignmentControlProps = {
  value: TextAlign
  onChange: (value: TextAlign) => void
  className?: string
}

const OPTIONS: { value: TextAlign; icon: typeof AlignLeftIcon; label: string }[] = [
  { value: 'left', icon: AlignLeftIcon, label: 'Left' },
  { value: 'center', icon: AlignCenterIcon, label: 'Center' },
  { value: 'right', icon: AlignRightIcon, label: 'Right' },
]

export function AlignmentControl({ value, onChange, className }: AlignmentControlProps) {
  return (
    <div
      className={cn('inline-flex rounded-md border bg-muted/40 p-0.5', className)}
      role="radiogroup"
      aria-label="Text alignment"
    >
      {OPTIONS.map(opt => {
        const Icon = opt.icon
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex size-7 items-center justify-center rounded-sm transition',
              active ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
