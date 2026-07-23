'use client'

import {
  getSocialPlatformLabel,
  SocialPlatformIcon,
} from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { TimezoneSelector } from '@/components/ui/timezone-selector'
import { formatTimezoneCity } from '@/lib/timezone'
import { updateAccount } from '@/services/account.service'
import type { Account } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type EditAccountDialogProps = {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

function EditAccountForm({
  account,
  onClose,
  onUpdated,
}: {
  account: Account
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
        <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border/50 bg-muted/15 px-2.5 py-2">
          <div className="relative shrink-0">
            <Avatar className="size-8 ring-1 ring-border/40">
              {account.accountAvatar ? <AvatarImage src={account.accountAvatar} alt="" /> : null}
              <AvatarFallback className="bg-muted/80 text-[10px] font-semibold">
                {getInitials(account.accountName)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-[4px] bg-background ring-1 ring-border/60">
              <SocialPlatformIcon provider={account.provider} size={7} framed={false} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight tracking-tight">
              {account.accountName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
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

      <DialogFooter className="shrink-0 border-t border-border/50 bg-muted/10 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-lg shadow-xs"
          onClick={handleSave}
          disabled={isPending || !timezone}
        >
          {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
      </DialogFooter>
    </div>
  )
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
  onUpdated,
}: EditAccountDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 gap-1 border-b border-border/50 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">Edit account</DialogTitle>
          <p className="text-xs text-muted-foreground">Update the timezone used for scheduling.</p>
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
