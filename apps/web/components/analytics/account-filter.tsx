'use client'

import { useRouter } from 'next/navigation'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { buildAnalyticsDashboardHref } from '@/utils/analytics-href'
import { getAccountInitials } from '@/utils/account-display.utils'
import type {
  AccountSummary,
  AnalyticsAccountPerformanceRankBy,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'
import { UsersIcon } from 'lucide-react'

const ALL_ACCOUNTS = 'all'

export type AccountFilterProps = {
  accounts: AccountSummary[]
  active?: string
  range: AnalyticsRange
  rankBy?: AnalyticsAccountPerformanceRankBy
  provider?: SocialProvider | 'all'
  className?: string
}

function AccountFilter({
  accounts,
  active,
  range,
  rankBy = 'followerGrowth',
  provider = 'all',
  className,
}: AccountFilterProps) {
  const router = useRouter()
  const current = active && accounts.some(account => account._id === active) ? active : ALL_ACCOUNTS

  const handleChange = (value: string) => {
    router.push(
      buildAnalyticsDashboardHref({
        range,
        rankBy,
        provider: value === ALL_ACCOUNTS ? provider : undefined,
        accountId: value === ALL_ACCOUNTS ? undefined : value,
      }),
      { scroll: false },
    )
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        aria-label="Filter by account"
        className={cn(
          'h-8 min-w-40 max-w-56 shrink-0 rounded-full border-border/60 bg-background px-3 shadow-xs dark:border-border/70',
          'dark:bg-background dark:hover:bg-muted/40',
          className,
        )}
      >
        <SelectValue placeholder="All accounts" />
      </SelectTrigger>
      <SelectContent align="start" position="popper" className="min-w-56">
        <SelectItem value={ALL_ACCOUNTS}>
          <UsersIcon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          All accounts
        </SelectItem>
        {accounts.map(account => (
          <SelectItem key={account._id} value={account._id}>
            <span className="flex min-w-0 items-center gap-2">
              <span className="relative shrink-0">
                <Avatar className="size-4">
                  <AvatarImage src={account.accountAvatar} alt="" />
                  <AvatarFallback className="text-[8px]">{getAccountInitials(account)}</AvatarFallback>
                </Avatar>
                <SocialPlatformIcon
                  provider={account.provider}
                  size={10}
                  className="absolute -right-1 -bottom-0.5 size-2.5 rounded-[3px] ring-1 ring-background [&_svg]:size-1.5"
                />
              </span>
              <span className="truncate">{account.accountName}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { AccountFilter }
