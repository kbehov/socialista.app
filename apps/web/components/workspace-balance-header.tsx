'use client'

import { CreditCardIcon, WalletIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatCredits } from '@/utils/format'

const LOW_BALANCE_THRESHOLD = 500
const CRITICAL_BALANCE_THRESHOLD = 100

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
    icon: 'text-muted-foreground',
    text: 'text-foreground',
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
          className="rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Badge
            variant="ghost"
            className={cn(
              'h-7 cursor-pointer gap-1.5 rounded-[6px] px-2 font-medium tabular-nums transition-colors hover:bg-muted/60',
              className,
            )}
          >
            <WalletIcon className={cn('size-3.5', tone.icon)} strokeWidth={1.5} />
            <span className={cn('text-[13px] font-medium tracking-tight', tone.text)}>{formatCredits(balance)}</span>
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
          <CreditCardIcon className="size-3.5" strokeWidth={1.5} />
          <span className="text-xs">Top up</span>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
