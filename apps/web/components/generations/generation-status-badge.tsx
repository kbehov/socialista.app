'use client'

import { Badge } from '@/components/ui/badge'
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
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.className, className)}>
      <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </Badge>
  )
}
