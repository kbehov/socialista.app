import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Marquee } from '@/components/ui/marquee'

import { PLATFORMS } from './content'

export function PlatformsMarquee() {
  const items = [...PLATFORMS, ...PLATFORMS]

  return (
    <div className="border-y border-border bg-background/50">
      <Marquee pauseOnHover className="py-3 [--duration:45s] [--gap:2.5rem]">
        {items.map((platform, index) => (
          <div
            key={`${platform.id}-${index}`}
            className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground"
          >
            <SocialPlatformIcon provider={platform.id} size={16} framed={false} />
            <span>{platform.label}</span>
          </div>
        ))}
      </Marquee>
    </div>
  )
}
