'use client'

import { CreditCardIcon, WalletIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const LOW_BALANCE_THRESHOLD = 5
const CRITICAL_BALANCE_THRESHOLD = 1

function formatCredits(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function getBalanceTone(balance: number) {
  if (balance <= CRITICAL_BALANCE_THRESHOLD) {
    return {
      icon: 'text-red-500',
      text: 'text-red-600 dark:text-red-400',
      message: 'Your balance is critically low',
    }
  }
  if (balance <= LOW_BALANCE_THRESHOLD) {
    return {
      icon: 'text-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      message: 'Your balance is running low',
    }
  }
  return {
    icon: 'text-emerald-500',
    text: '',
    message: 'Available balance for generation',
  }
}

export function WorkspaceBalanceHeader({
  balance,
  className,
  onTopUp,
}: {
  balance: number
  className?: string
  onTopUp?: () => void
}) {
  const tone = getBalanceTone(balance)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Wallet balance ${formatCredits(balance)}. Open to top up.`}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Badge
            variant="ghost"
            className={cn(
              'h-7 cursor-pointer gap-1.5 rounded-md px-2 font-medium tabular-nums transition-colors hover:bg-muted',
              className,
            )}
          >
            <WalletIcon className={cn('size-3', tone.icon)} strokeWidth={1.75} />
            <span className={cn('text-xs', tone.text)}>{formatCredits(balance)}</span>
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="flex w-56 flex-col gap-1 text-xs p-4">
        <p className="font-medium">AI credits</p>
        <p className="text-muted-foreground">{tone.message}</p>
        <Button
          variant="default"
          size="sm"
          className="mt-1.5 w-full bg-foreground text-xs text-background"
          onClick={onTopUp}
        >
          <CreditCardIcon className="size-3.5" strokeWidth={1.75} />
          <span className="text-xs">Top Up</span>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
