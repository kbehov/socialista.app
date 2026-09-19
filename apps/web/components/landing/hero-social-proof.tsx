import { Check } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { HERO_PROOF_POINTS, HERO_SOCIAL_PROOF } from './content'
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

      <ul className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--landing-stone)_85%,transparent)] bg-[color-mix(in_srgb,white_78%,var(--landing-canvas))] text-left shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent),0_12px_32px_-20px_color-mix(in_oklch,var(--landing-ink)_12%,transparent)] sm:grid-cols-3">
        {HERO_PROOF_POINTS.map((point, index) => (
          <li
            key={point}
            className={cn(
              'flex items-center gap-2.5 px-5 py-4 text-sm font-medium tracking-[-0.015em] text-[var(--landing-ink)] sm:justify-center sm:px-4',
              index > 0 && 'sm:border-l sm:border-[color-mix(in_srgb,var(--landing-stone)_80%,transparent)]',
              index > 0 && 'border-t border-[color-mix(in_srgb,var(--landing-stone)_80%,transparent)] sm:border-t-0',
            )}
          >
            <Check className="size-4 shrink-0 text-[var(--landing-orange)]" strokeWidth={2.25} aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}
