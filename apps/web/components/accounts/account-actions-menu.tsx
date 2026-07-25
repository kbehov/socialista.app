import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ConfirmAction } from '@/types/account.types'
import type { AccountSummary } from '@socialista/types'
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, UnplugIcon } from 'lucide-react'

type AccountActionsMenuProps = {
  account: AccountSummary
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
  triggerClassName?: string
}

export function AccountActionsMenu({ account, onAction, onEdit, triggerClassName }: AccountActionsMenuProps) {
  const canDisconnect = account.connectionStatus === 'connected'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={triggerClassName ?? 'size-8 rounded-lg'}
          aria-label={`Actions for ${account.accountName}`}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onEdit(account)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
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
