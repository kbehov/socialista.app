import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { ConnectProvider } from '@socialista/types'

/** Same networks as the connect dialog, ordered for a balanced color rhythm. */
const PLATFORM_MARKS: ConnectProvider[] = [
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'threads',
  'twitter',
]

const MARK_LIFT = [
  { y: 'translate-y-2', z: 'z-10', scale: 'scale-[0.92]' },
  { y: 'translate-y-1', z: 'z-20', scale: 'scale-[0.96]' },
  { y: 'translate-y-0', z: 'z-30', scale: 'scale-100' },
  { y: 'translate-y-0', z: 'z-30', scale: 'scale-100' },
  { y: 'translate-y-1', z: 'z-20', scale: 'scale-[0.96]' },
  { y: 'translate-y-2', z: 'z-10', scale: 'scale-[0.92]' },
] as const

function AccountEmptyMarks() {
  return (
    <div
      className="flex max-w-full items-end justify-center gap-2 px-0.5 min-[400px]:gap-2.5 sm:gap-3.5 sm:px-1"
      aria-hidden
    >
      {PLATFORM_MARKS.map((provider, index) => {
        const lift = MARK_LIFT[index] ?? MARK_LIFT[2]

        return (
          <span key={provider} className={cn('relative shrink-0', lift.y, lift.z, lift.scale)}>
            <SocialPlatformIcon
              provider={provider}
              size={18}
              className="size-10 rounded-[var(--radius-lg)] shadow-[var(--shadow-border)] ring-0 min-[400px]:size-11 sm:size-12"
            />
          </span>
        )
      })}
    </div>
  )
}

export { AccountEmptyMarks }
