import { getInitials } from '@/utils/format'
import type { AccountSummary } from '@socialista/types'
import { SocialPlatformIcon } from '../icons/social-platform-icon'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '../ui/avatar'
type AccountAvatarProps = {
  account: AccountSummary
  size?: 'sm' | 'lg'
  showBadge?: boolean
}
export function AccountAvatar({ account, size = 'lg', showBadge = true }: AccountAvatarProps) {
  return (
    <div className="relative">
      <Avatar size={size}>
        <AvatarImage src={account.accountAvatar} />
        <AvatarFallback>{getInitials(account.accountName)}</AvatarFallback>
        {showBadge && (
          <AvatarBadge className="size-6">
            <SocialPlatformIcon provider={account.provider} size={16} framed={true} />
          </AvatarBadge>
        )}
      </Avatar>
    </div>
  )
}
