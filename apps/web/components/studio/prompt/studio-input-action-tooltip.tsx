'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ComponentProps, ReactNode } from 'react'

type StudioInputActionTooltipProps = {
  label: ReactNode
  children: ReactNode
  side?: ComponentProps<typeof TooltipContent>['side']
  shortcut?: string
}

export function StudioInputActionTooltip({
  label,
  children,
  side = 'top',
  shortcut,
}: StudioInputActionTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        {label}
        {shortcut ? <span className="ml-2 text-background/70">{shortcut}</span> : null}
      </TooltipContent>
    </Tooltip>
  )
}
