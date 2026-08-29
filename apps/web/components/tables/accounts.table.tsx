'use client'

import { AccountRow, ACCOUNT_ROW_GRID } from '@/components/accounts/account-row'
import { EditAccountDialog } from '@/components/accounts/edit-account-dialog'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { cn } from '@/lib/utils'
import { deleteAccount, disconnectAccount } from '@/services/account.service'
import type { ConfirmAction } from '@/types/account.types'
import { buildDuplicateNameKeys } from '@/utils/account-display.utils'
import type { AccountSummary } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type AccountsTableProps = {
  accounts: AccountSummary[]
  className?: string
}

export function AccountsTable({ accounts, className }: AccountsTableProps) {
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [editAccount, setEditAccount] = useState<AccountSummary | null>(null)
  const [isPending, setIsPending] = useState(false)
  const duplicateNameKeys = useMemo(() => buildDuplicateNameKeys(accounts), [accounts])

  const handleConfirm = async () => {
    if (!confirmAction || isPending) return
    setIsPending(true)

    const { type, account } = confirmAction
    const response = type === 'disconnect' ? await disconnectAccount(account._id) : await deleteAccount(account._id)

    setIsPending(false)

    if (!response.success) {
      toast.error(
        response.message ?? (type === 'disconnect' ? 'Failed to disconnect account' : 'Failed to remove account'),
      )
      return
    }

    toast.success(type === 'disconnect' ? `Disconnected “${account.accountName}”` : `Removed “${account.accountName}”`)
    setConfirmAction(null)
    router.refresh()
  }

  return (
    <>
      <div className={cn('min-w-0', className)}>
        <div className={cn('hidden border-b border-foreground/10 py-2', ACCOUNT_ROW_GRID)} aria-hidden>
          <span className="text-[11px] font-medium text-foreground/56">Account</span>
          <span className="hidden text-[11px] font-medium text-foreground/56 sm:block">Platform</span>
          <span className="hidden text-[11px] font-medium text-foreground/56 sm:block">Status</span>
          <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">Timezone</span>
          <span className="hidden text-[11px] font-medium text-foreground/56 xl:block">Connected</span>
          <span aria-hidden />
        </div>

        <ul className="divide-y divide-foreground/10">
          {accounts.map(account => (
            <AccountRow
              key={account._id}
              account={account}
              duplicateNameKeys={duplicateNameKeys}
              onAction={setConfirmAction}
              onEdit={setEditAccount}
            />
          ))}
        </ul>
      </div>

      <EditAccountDialog
        account={editAccount}
        open={editAccount !== null}
        onOpenChange={open => {
          if (!open) setEditAccount(null)
        }}
        onUpdated={() => router.refresh()}
      />

      <DeleteConfirmDialog
        open={confirmAction !== null}
        onOpenChange={open => {
          if (!open) setConfirmAction(null)
        }}
        title={confirmAction?.type === 'disconnect' ? 'Disconnect account' : 'Remove account'}
        description={
          confirmAction?.type === 'disconnect'
            ? `“${confirmAction.account.accountName}” will be disconnected. You can reconnect it later.`
            : confirmAction
              ? `“${confirmAction.account.accountName}” will be removed from this workspace. This cannot be undone.`
              : ''
        }
        confirmLabel={confirmAction?.type === 'disconnect' ? 'Disconnect' : 'Remove account'}
        isDeleting={isPending}
        onConfirm={() => void handleConfirm()}
      />
    </>
  )
}
