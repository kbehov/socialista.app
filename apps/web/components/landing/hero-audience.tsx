import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'

import { HERO_AUDIENCE } from './content'
import { TALENT } from './media'

const HERO_AVATARS = TALENT.slice(0, 4)

export function HeroAudience() {
  return (
    <div className="mt-5 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center sm:gap-5">
      <AvatarGroup className="shrink-0 *:data-[slot=avatar]:size-9">
        {HERO_AVATARS.map(person => (
          <Avatar key={person.name} className="ring-2 ring-background">
            <AvatarImage src={person.src} alt={person.name} />
            <AvatarFallback>{person.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>

      <div className="text-center sm:text-left">
        <p className="text-sm font-medium tracking-[-0.02em] text-foreground">{HERO_AUDIENCE.title}</p>
        <p className="text-sm text-muted-foreground">{HERO_AUDIENCE.subtitle}</p>
      </div>
    </div>
  )
}
