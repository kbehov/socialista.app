import { ConnectionStatusBadge } from '@/components/common/connection-status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AccountSummary } from '@socialista/types'

export function AccountConnectionStatus({ account }: { account: AccountSummary }) {
  if (account.lastError && account.connectionStatus === 'error') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <ConnectionStatusBadge status={account.connectionStatus} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-60">
          {account.lastError}
        </TooltipContent>
      </Tooltip>
    )
  }

  return <ConnectionStatusBadge status={account.connectionStatus} />
}
