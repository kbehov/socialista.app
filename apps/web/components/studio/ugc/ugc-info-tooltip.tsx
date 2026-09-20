'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type UgcInfoTooltipProps = {
  label: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function UgcInfoTooltip({ label, side = 'top' }: UgcInfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="More info"
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground/70 hover:text-muted-foreground"
        >
          <InfoIcon className="size-3.5" strokeWidth={1.75} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}
