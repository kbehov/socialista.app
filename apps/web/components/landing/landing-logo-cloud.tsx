import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'

import { LANDING_CHANNELS } from './content'
import { FadeIn } from './fade-in'
import { landingEyebrow, landingSupportingSectionY } from './landing-classes'
import { SectionInner } from './section'

/** Channel marks — customer logos are not invented. */
export function LandingLogoCloud() {
  return (
    <section aria-labelledby="logo-cloud-heading" className={cn(landingSupportingSectionY, 'bg-[var(--landing-surface-muted)]')}>
      <SectionInner>
        <FadeIn className="flex flex-col items-center">
          <h2 id="logo-cloud-heading" className={landingEyebrow}>
            One queue, every channel
          </h2>
          <ul className="mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-10">
            {LANDING_CHANNELS.map(channel => (
              <li
                key={channel.id}
                className="flex items-center gap-2 text-sm font-medium tracking-[-0.015em] text-[var(--landing-muted)]"
              >
                <SocialPlatformIcon
                  provider={channel.id}
                  framed={false}
                  size={18}
                  className="shrink-0 grayscale"
                />
                {channel.label}
              </li>
            ))}
          </ul>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
