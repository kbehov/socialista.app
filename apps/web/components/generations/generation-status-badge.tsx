'use client'

import { cn } from '@/lib/utils'
import type { GenerationStatus } from '@socialista/types'
import { GENERATION_STATUS_META } from './generation-meta'

export function GenerationStatusBadge({
  status,
  className,
}: {
  status: GenerationStatus
  className?: string
}) {
  const meta = GENERATION_STATUS_META[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px] font-medium',
        meta.className,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </span>
  )
}
