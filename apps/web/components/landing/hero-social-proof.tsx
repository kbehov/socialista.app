import { Check } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { HERO_PROOF_POINTS, HERO_SOCIAL_PROOF } from './content'
import { landingGlassLight } from './landing-classes'
import { IMG } from './media'

const HERO_AVATARS = [
  { src: IMG.posterUgc1, fallback: 'A' },
  { src: IMG.posterUgc3, fallback: 'B' },
  { src: IMG.posterUgc4, fallback: 'C' },
  { src: IMG.posterUgc6, fallback: 'D' },
  { src: IMG.posterUgc9, fallback: 'E' },
] as const

type HeroSocialProofProps = {
  className?: string
}

export function HeroSocialProof({ className }: HeroSocialProofProps) {
  return (
    <div className={cn('flex w-full max-w-4xl flex-col items-center gap-6', className)}>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-3.5">
        <AvatarGroup className="-space-x-2 *:data-[slot=avatar]:size-7 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
          {HERO_AVATARS.map(avatar => (
            <Avatar key={avatar.fallback} size="sm">
              <AvatarImage src={avatar.src} alt="" />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>

        <div className="flex flex-col items-center gap-0.5 text-center sm:items-start sm:text-left">
          <p className="text-[0.8125rem] leading-snug tracking-[-0.01em] text-[var(--landing-ink)]">
            <span className="font-semibold">{HERO_SOCIAL_PROOF.lead}</span>
          </p>
          <p className="text-xs leading-snug text-[var(--landing-muted)]">{HERO_SOCIAL_PROOF.subline}</p>
        </div>
      </div>

      <ul
        className={cn(
          'grid w-full grid-cols-1 overflow-hidden rounded-2xl text-left sm:grid-cols-3',
          landingGlassLight,
        )}
      >
        {HERO_PROOF_POINTS.map((point, index) => (
          <li
            key={point}
            className={cn(
              'flex items-center gap-2.5 px-5 py-4 text-sm font-medium tracking-[-0.015em] text-[var(--landing-ink)] sm:justify-center sm:px-4',
              index > 0 &&
                'sm:border-l sm:border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]',
              index > 0 &&
                'border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] sm:border-t-0',
            )}
          >
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]"
              aria-hidden="true"
            >
              <Check className="size-3 text-[var(--landing-ink)]" strokeWidth={2.5} />
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}
