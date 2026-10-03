import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'

import { HERO_CHANNELS_LABEL, LANDING_CHANNELS } from './content'

type HeroSocialProofProps = {
  className?: string
}

/** Channels Socialista can publish to. Counts stay off this row until they are real. */
export function HeroSocialProof({ className }: HeroSocialProofProps) {
  return (
    <div className={cn('flex w-full max-w-4xl flex-col items-center gap-6', className)}>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--landing-muted)]">
          {HERO_CHANNELS_LABEL}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {LANDING_CHANNELS.map(channel => (
            <li
              key={channel.id}
              className="flex items-center gap-2 text-sm font-medium tracking-[-0.015em] text-[color-mix(in_srgb,var(--landing-ink)_78%,transparent)]"
            >
              <SocialPlatformIcon provider={channel.id} framed={false} size={16} className="shrink-0" aria-hidden="true" />
              {channel.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
