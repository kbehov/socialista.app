'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ReactElement, ReactNode } from 'react'

type HeaderTooltipProps = {
  label: ReactNode
  children: ReactElement
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function HeaderTooltip({
  label,
  children,
  className,
  side = 'bottom',
}: HeaderTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex', className)}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  )
}
