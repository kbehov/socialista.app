'use client'

import { SparklesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function formatCredits(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function WorkspaceBalanceHeader({ balance, className }: { balance: number; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'h-7 gap-1.5 rounded-md border-border/60 bg-background px-2 font-medium tabular-nums',
            className,
          )}
        >
          <SparklesIcon className="size-3 text-amber-500" strokeWidth={1.75} />
          <span className="text-xs">{formatCredits(balance)}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-medium">AI credits</p>
        <p className="text-muted-foreground">Available balance for generation</p>
      </TooltipContent>
    </Tooltip>
  )
}
