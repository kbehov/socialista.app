import { AccountAvatar } from '@/components/accounts/account-avatar'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { formatHandle, getAccountPrimaryLabel } from '@/utils/account-display.utils'
import type { AccountSummary } from '@socialista/types'

const EMPTY_DUPES = new Map<string, number>()

type AccountIdentityProps = {
  account: AccountSummary
  duplicateNameKeys?: Map<string, number>
}

export function AccountIdentity({ account, duplicateNameKeys }: AccountIdentityProps) {
  const keys = duplicateNameKeys ?? EMPTY_DUPES
  const primary = getAccountPrimaryLabel(account, keys)
  const secondary = formatHandle(account.username) || getSocialPlatformLabel(account.provider)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <AccountAvatar account={account} size="default" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em] text-foreground">{primary}</p>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-foreground/56">{secondary}</p>
      </div>
    </div>
  )
}
