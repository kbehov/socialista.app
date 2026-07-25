import { AccountAvatar } from '@/components/accounts/account-avatar'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import type { AccountSummary } from '@socialista/types'

export function AccountIdentity({ account }: { account: AccountSummary }) {
  const handle = account.username ? `@${account.username.replace(/^@/, '')}` : null
  const platformLabel = getSocialPlatformLabel(account.provider)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <AccountAvatar account={account} size="lg" showBadge={false} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">{account.accountName}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{handle ?? platformLabel}</p>
      </div>
    </div>
  )
}
