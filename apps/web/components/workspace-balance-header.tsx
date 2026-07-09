'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'

function formatCredits(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function WorkspaceBalanceHeader() {
  const { credits, balance, isLoading, error } = useWorkspaceBilling()

  if (isLoading) {
    return <Skeleton className="h-8 w-24 rounded-full" />
  }

  if (error) {
    return null
  }

  const plan = balance?.plan ?? 'free'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className=" tabular-nums">
          {formatCredits(credits)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-medium">AI credits balance</p>
        <p className="capitalize text-muted-foreground">{plan} plan</p>
      </TooltipContent>
    </Tooltip>
  )
}
