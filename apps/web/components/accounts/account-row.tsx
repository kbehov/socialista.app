import { AccountActionsMenu } from '@/components/accounts/account-actions-menu'
import { AccountConnectionStatus } from '@/components/accounts/account-connection-status'
import { AccountIdentity } from '@/components/accounts/account-identity'
import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { STATUS_META } from '@/constants/accounts'
import { cn } from '@/lib/utils'
import type { ConfirmAction } from '@/types/account.types'
import { formatDate, formatRelativeTime, formatTimezoneCity } from '@/utils/format'
import type { AccountSummary } from '@socialista/types'

export const ACCOUNT_ROW_GRID =
  'sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_2rem] sm:items-center sm:gap-3 lg:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_minmax(0,7rem)_2rem] xl:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_minmax(0,7rem)_4.75rem_2rem]'

type AccountRowProps = {
  account: AccountSummary
  duplicateNameKeys: Map<string, number>
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
}

export function AccountRow({ account, duplicateNameKeys, onAction, onEdit }: AccountRowProps) {
  const platformLabel = getSocialPlatformLabel(account.provider)
  const timezoneCity = formatTimezoneCity(account.timezone)
  const connectedLabel = formatRelativeTime(account.createdAt)
  const mobileMeta = [STATUS_META[account.connectionStatus].label, timezoneCity].join(' · ')

  return (
    <li className="group transition-colors duration-150 ease-out hover:bg-muted">
      <div className={cn('flex items-center gap-3 py-2', ACCOUNT_ROW_GRID)}>
        <div className="min-w-0 flex-1">
          <AccountIdentity account={account} duplicateNameKeys={duplicateNameKeys} />
          <p className="mt-0.5 truncate pl-11 text-[11px] leading-tight text-foreground/56 sm:hidden">{mobileMeta}</p>
        </div>

        <div className="hidden min-w-0 sm:block">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground/56">
            <SocialPlatformIcon provider={account.provider} size={12} framed={false} className="size-3.5 shrink-0" />
            <span className="truncate">{platformLabel}</span>
          </span>
        </div>

        <div className="hidden sm:block">
          <AccountConnectionStatus account={account} />
        </div>

        <div className="hidden min-w-0 lg:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block cursor-default truncate text-[13px] text-foreground/56">{timezoneCity}</span>
            </TooltipTrigger>
            <TooltipContent side="top">{account.timezone}</TooltipContent>
          </Tooltip>
        </div>

        <div className="hidden xl:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-[13px] tabular-nums text-foreground/56">{connectedLabel}</span>
            </TooltipTrigger>
            <TooltipContent side="top">{formatDate(account.createdAt)}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex shrink-0 justify-end">
          <AccountActionsMenu account={account} onAction={onAction} onEdit={onEdit} />
        </div>
      </div>
    </li>
  )
}
