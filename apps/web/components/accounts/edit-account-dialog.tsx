'use client'

import { AccountAvatar } from '@/components/accounts/account-avatar'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { updateAccount } from '@/services/account.service'
import { formatTimezoneCity } from '@/utils/timezone'
import type { AccountSummary } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type EditAccountDialogProps = {
  account: AccountSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function EditAccountForm({
  account,
  onClose,
  onUpdated,
}: {
  account: AccountSummary
  onClose: () => void
  onUpdated?: () => void
}) {
  const [timezone, setTimezone] = useState(account.timezone)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (isPending) return

    if (timezone === account.timezone) {
      onClose()
      return
    }

    startTransition(async () => {
      const response = await updateAccount(account._id, { timezone })

      if (!response.success) {
        toast.error(response.message ?? 'Failed to update account')
        return
      }

      toast.success(`Timezone updated to ${formatTimezoneCity(timezone)}`)
      onClose()
      onUpdated?.()
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-4">
        <div className="flex min-w-0 items-center gap-2.5 px-0.5 py-1">
          <AccountAvatar account={account} size="default" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em]">{account.accountName}</p>
            <p className="mt-0.5 truncate text-[11px] text-foreground/56">
              {getSocialPlatformLabel(account.provider)}
              {account.username ? ` · @${account.username.replace(/^@/, '')}` : ''}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <Label htmlFor="account-timezone" className="text-xs font-medium text-muted-foreground">
            Timezone
          </Label>
          <TimezoneSelector
            id="account-timezone"
            value={timezone}
            onChange={setTimezone}
            disabled={isPending}
            mode="inline"
            defaultOpen
            className="min-h-0 flex-1"
          />
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t border-border/50 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-md shadow-none"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-md shadow-none"
          onClick={handleSave}
          disabled={isPending || !timezone}
        >
          {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          Save changes
        </Button>
      </DialogFooter>
    </div>
  )
}

export function EditAccountDialog({ account, open, onOpenChange, onUpdated }: EditAccountDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/50 px-5 py-4 text-left">
          <DialogTitle className="text-[15px] font-medium tracking-tight">Edit account</DialogTitle>
          <p className="text-[13px] text-muted-foreground">Timezone used for scheduling.</p>
        </DialogHeader>

        {account ? (
          <EditAccountForm
            key={account._id}
            account={account}
            onClose={() => onOpenChange(false)}
            onUpdated={onUpdated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
