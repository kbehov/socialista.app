'use client'

import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AccountSummary, SocialProvider } from '@socialista/types'
import { useMemo } from 'react'

export function AccountsSummary({ accounts }: { accounts: AccountSummary[] }) {
  const connectedCount = accounts.filter(a => a.connectionStatus === 'connected').length
  const platforms = useMemo(() => {
    const seen = new Set<SocialProvider>()
    for (const account of accounts) {
      seen.add(account.provider)
    }
    return [...seen]
  }, [accounts])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <p className="text-[13px] font-medium tracking-tight text-foreground">
          {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
        </p>
        <span className="hidden h-3 w-px bg-border/80 sm:block" aria-hidden />
        <p className="hidden text-[13px] text-muted-foreground sm:block">{connectedCount} connected</p>
      </div>
      <div className="flex items-center gap-1.5">
        {platforms.map(provider => (
          <Tooltip key={provider}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <SocialPlatformIcon
                  provider={provider}
                  size={12}
                  className="size-7 rounded-lg opacity-80 transition-opacity hover:opacity-100"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {getSocialPlatformLabel(provider)}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
