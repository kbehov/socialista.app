'use client'

import { AccountRow } from '@/components/accounts/account-row'
import { AccountTableRow } from '@/components/accounts/account-table-row'
import { AccountsSummary } from '@/components/accounts/accounts-summary'
import { EditAccountDialog } from '@/components/accounts/edit-account-dialog'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { deleteAccount, disconnectAccount } from '@/services/account.service'
import type { ConfirmAction } from '@/types/account.types'
import type { AccountSummary } from '@socialista/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
      <div className={cn('flex flex-col gap-3', className)}>
        <AccountsSummary accounts={accounts} />

        <div className="grid gap-2.5 sm:hidden">
          {accounts.map(account => (
            <AccountRow key={account._id} account={account} onAction={setConfirmAction} onEdit={setEditAccount} />
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-background shadow-xs sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Account
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase md:table-cell">
                  Platform
                </TableHead>
                <TableHead className="h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase lg:table-cell">
                  Timezone
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase xl:table-cell">
                  Connected
                </TableHead>
                <TableHead className="h-10 w-13 px-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(account => (
                <AccountTableRow
                  key={account._id}
                  account={account}
                  onAction={setConfirmAction}
                  onEdit={setEditAccount}
                />
              ))}
            </TableBody>
          </Table>
        </div>
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
