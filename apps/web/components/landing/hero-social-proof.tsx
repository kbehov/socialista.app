import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { HERO_SOCIAL_PROOF } from '@/components/landing/content'
import { IMG } from '@/components/landing/media'
import { cn } from '@/lib/utils'

const HERO_AVATARS = [
  { src: IMG.posterUgc1, fallback: 'A' },
  { src: IMG.posterUgc3, fallback: 'B' },
  { src: IMG.posterUgc4, fallback: 'C' },
  { src: IMG.posterUgc6, fallback: 'D' },
  { src: IMG.posterUgc9, fallback: 'E' },
  { src: IMG.posterUgc12, fallback: 'F' },
] as const

type HeroSocialProofProps = {
  className?: string
}

export function HeroSocialProof({ className }: HeroSocialProofProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3', className)}>
      <AvatarGroup className="-space-x-1.5 *:data-[slot=avatar]:size-6 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
        {HERO_AVATARS.map(avatar => (
          <Avatar key={avatar.src} size="sm">
            <AvatarImage src={avatar.src} alt="" />
            <AvatarFallback>{avatar.fallback}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>

      <div className="flex flex-col items-center gap-0.5 text-center sm:items-start sm:text-left">
        <p className="text-xs leading-snug tracking-[-0.01em] text-foreground/90">
          <span className="font-semibold tabular-nums text-foreground">
            {HERO_SOCIAL_PROOF.count}
          </span>{' '}
          {HERO_SOCIAL_PROOF.label}
        </p>
        <p className="text-[0.6875rem] leading-snug text-muted-foreground">
          {HERO_SOCIAL_PROOF.subline}
        </p>
      </div>
    </div>
  )
}
