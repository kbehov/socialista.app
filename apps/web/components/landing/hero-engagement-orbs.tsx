import { Eye, Heart } from 'lucide-react'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

type OrbKind = 'like' | 'view'

type HeroEngagementOrbsProps = {
  likes: string
  views: string
  className?: string
}

const ORB_SLOTS: { id: string; kind: OrbKind; className: string; duration: string; delay: string }[] = [
  {
    id: 'title-view-left',
    kind: 'view',
    className: 'left-[max(-0.15rem,-1%)] top-[22%] sm:left-[-0.5rem] lg:left-[-1.25rem]',
    duration: '5.4s',
    delay: '0.2s',
  },
  {
    id: 'title-like-right',
    kind: 'like',
    className: 'right-[max(-0.15rem,-1%)] top-[12%] sm:right-[-0.5rem] lg:right-[-1.25rem]',
    duration: '4.8s',
    delay: '0.55s',
  },
]

/** Floating like/view pills around the hero headline — CSS float, see `.landing-orb-float`. */
export function HeroEngagementOrbs({ likes, views, className }: HeroEngagementOrbsProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 hidden sm:block', className)} aria-hidden="true">
      {ORB_SLOTS.map(slot => (
        <div
          key={slot.id}
          className={cn(
            'landing-orb-float absolute z-20 flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-[color-mix(in_srgb,white_78%,var(--landing-canvas))] px-2.5 py-1.5 text-[var(--landing-ink)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.65),0_12px_32px_-16px_rgb(0_0_0/0.18)] backdrop-blur-xl backdrop-saturate-150',
            slot.className,
          )}
          style={{ '--orb-duration': slot.duration, '--orb-delay': slot.delay } as CSSProperties}
        >
          {slot.kind === 'like' ? (
            <Heart className="size-3 shrink-0 fill-[#ff375f] text-[#ff375f]" strokeWidth={0} />
          ) : (
            <Eye className="size-3 shrink-0 text-[var(--landing-muted)]" strokeWidth={2.25} />
          )}
          <span className="text-[0.6875rem] font-semibold leading-none tracking-[-0.02em] tabular-nums">
            {slot.kind === 'like' ? likes : views}
          </span>
        </div>
      ))}
    </div>
  )
}
