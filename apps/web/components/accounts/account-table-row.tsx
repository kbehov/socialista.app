import { AccountActionsMenu } from '@/components/accounts/account-actions-menu'
import { AccountConnectionStatus } from '@/components/accounts/account-connection-status'
import { AccountIdentity } from '@/components/accounts/account-identity'
import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ConfirmAction } from '@/types/account.types'
import { formatDate, formatRelativeTime, formatTimezoneCity } from '@/utils/format'
import type { AccountSummary } from '@socialista/types'
import { GlobeIcon } from 'lucide-react'

const ROW_ICON_STROKE = 1.5

type AccountTableRowProps = {
  account: AccountSummary
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
}

export function AccountTableRow({ account, onAction, onEdit }: AccountTableRowProps) {
  const platformLabel = getSocialPlatformLabel(account.provider)
  const timezoneCity = formatTimezoneCity(account.timezone)

  return (
    <TableRow className="group border-border/50 transition-colors duration-150 hover:bg-muted/30">
      <TableCell className="px-4 py-3 whitespace-normal">
        <AccountIdentity account={account} />
      </TableCell>

      <TableCell className="hidden px-4 py-3 md:table-cell">
        <div className="flex items-center gap-2">
          <SocialPlatformIcon provider={account.provider} size={13} />
          <span className="text-sm text-foreground">{platformLabel}</span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3">
        <AccountConnectionStatus account={account} />
      </TableCell>

      <TableCell className="hidden px-4 py-3 lg:table-cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex max-w-40 cursor-default items-center gap-1.5 text-xs text-muted-foreground">
              <GlobeIcon className="size-3.5 shrink-0" strokeWidth={ROW_ICON_STROKE} />
              <span className="truncate">{timezoneCity}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{account.timezone}</TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell className="hidden px-4 py-3 xl:table-cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-xs tabular-nums text-muted-foreground">
              {formatRelativeTime(account.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{formatDate(account.createdAt)}</TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell className="px-2 py-3">
        <div
          className={cn(
            'flex justify-end transition-opacity duration-150',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
          )}
        >
          <AccountActionsMenu account={account} onAction={onAction} onEdit={onEdit} />
        </div>
      </TableCell>
    </TableRow>
  )
}
