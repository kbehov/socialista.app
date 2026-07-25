import { AccountActionsMenu } from '@/components/accounts/account-actions-menu'
import { AccountConnectionStatus } from '@/components/accounts/account-connection-status'
import { AccountIdentity } from '@/components/accounts/account-identity'
import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import type { ConfirmAction } from '@/types/account.types'
import { formatRelativeTime, formatTimezoneCity } from '@/utils/format'
import type { AccountSummary } from '@socialista/types'
import { GlobeIcon } from 'lucide-react'

type AccountRowProps = {
  account: AccountSummary
  onAction: (action: ConfirmAction) => void
  onEdit: (account: AccountSummary) => void
}

export function AccountRow({ account, onAction, onEdit }: AccountRowProps) {
  const platformLabel = getSocialPlatformLabel(account.provider)
  const timezoneCity = formatTimezoneCity(account.timezone)

  return (
    <article className="group rounded-xl border border-border/70 bg-background p-4 shadow-xs transition-all duration-150 hover:border-border hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <AccountIdentity account={account} />
        <AccountActionsMenu
          account={account}
          onAction={onAction}
          onEdit={onEdit}
          triggerClassName="size-8 shrink-0 rounded-lg opacity-60 transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <AccountConnectionStatus account={account} />

        <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
          <SocialPlatformIcon provider={account.provider} size={10} framed={false} />
          {platformLabel}
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <GlobeIcon className="size-3 opacity-70" strokeWidth={1.75} />
          {timezoneCity}
        </span>
      </div>

      <p className="mt-2.5 text-[11px] text-muted-foreground/80">Connected {formatRelativeTime(account.createdAt)}</p>
    </article>
  )
}
