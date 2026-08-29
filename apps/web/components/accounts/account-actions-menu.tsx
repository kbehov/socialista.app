import {
  getConnectHref,
  isConnectableProvider,
} from '@/components/accounts/connect-account-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { ConfirmAction } from '@/types/account.types'
import type { AccountSummary } from '@socialista/types'
import { BarChart3Icon, MoreHorizontalIcon, PencilIcon, PlugIcon, Trash2Icon, UnplugIcon } from 'lucide-react'
import Link from 'next/link'

type AccountActionsMenuProps = {
  account: AccountSummary
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
  triggerClassName?: string
}

export function AccountActionsMenu({ account, onAction, onEdit, triggerClassName }: AccountActionsMenuProps) {
  const canDisconnect = account.connectionStatus === 'connected'
  const connectableProvider = isConnectableProvider(account.provider) ? account.provider : null
  const canReconnect = account.connectionStatus === 'disconnected' && connectableProvider !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            'size-8 rounded-md text-foreground/56 hover:text-foreground',
            triggerClassName,
          )}
          aria-label={`Actions for ${account.accountName}`}
        >
          <MoreHorizontalIcon className="size-4" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={DASHBOARD_ROUTES.accountAnalytics(account._id)}>
            <BarChart3Icon />
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(account)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        {canReconnect && connectableProvider ? (
          <DropdownMenuItem asChild>
            <a href={getConnectHref(connectableProvider)}>
              <PlugIcon />
              Reconnect
            </a>
          </DropdownMenuItem>
        ) : null}
        {canDisconnect ? (
          <DropdownMenuItem onClick={() => onAction({ type: 'disconnect', account })}>
            <UnplugIcon />
            Disconnect
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction({ type: 'delete', account })}>
          <Trash2Icon />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
