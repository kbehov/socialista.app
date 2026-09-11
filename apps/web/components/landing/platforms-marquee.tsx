import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Marquee } from '@/components/ui/marquee'

import { PLATFORMS } from './content'

export function PlatformsMarquee() {
  const items = [...PLATFORMS, ...PLATFORMS]

  return (
    <div className="border-y border-border bg-surface-0/60">
      <p className="sr-only">Supported platforms</p>
      <Marquee pauseOnHover className="py-3.5 [--duration:50s] [--gap:2.75rem]">
        {items.map((platform, index) => (
          <div
            key={`${platform.id}-${index}`}
            className="flex items-center gap-2.5 px-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-foreground"
          >
            <SocialPlatformIcon provider={platform.id} size={16} framed={false} />
            <span>{platform.label}</span>
          </div>
        ))}
      </Marquee>
    </div>
  )
}
