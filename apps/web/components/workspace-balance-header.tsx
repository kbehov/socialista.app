'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'
import { SparklesIcon } from 'lucide-react'

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
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium tabular-nums">
          <SparklesIcon className="size-3.5 text-amber-500" />
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
