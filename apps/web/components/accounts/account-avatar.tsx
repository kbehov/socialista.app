import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getAccountInitials } from '@/utils/account-display.utils'
import type { AccountSummary } from '@socialista/types'

type AccountAvatarProps = {
  account: AccountSummary
  size?: 'sm' | 'default' | 'lg'
  showBadge?: boolean
}

const BADGE_CLASS: Record<NonNullable<AccountAvatarProps['size']>, string> = {
  sm: 'size-2.5 rounded-[3px] [&_svg]:size-1.5',
  default: 'size-3 rounded-[4px] [&_svg]:size-2',
  lg: 'size-3.5 rounded-[4px] [&_svg]:size-2.5',
}

export function AccountAvatar({ account, size = 'default', showBadge = true }: AccountAvatarProps) {
  return (
    <div className="relative shrink-0">
      <Avatar size={size}>
        <AvatarImage src={account.accountAvatar} alt="" />
        <AvatarFallback className="text-[10px] font-medium">{getAccountInitials(account)}</AvatarFallback>
      </Avatar>
      {showBadge ? (
        <SocialPlatformIcon
          provider={account.provider}
          size={10}
          className={cn(
            'absolute -right-0.5 -bottom-0.5 ring-1 ring-background',
            BADGE_CLASS[size],
          )}
        />
      ) : null}
    </div>
  )
}
