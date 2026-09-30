'use client'

import { Eye, Heart } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

type OrbKind = 'like' | 'view'

type OrbSlot = {
  id: string
  kind: OrbKind
  value: string
  className: string
  floatDuration: number
  floatDelay: number
  muted?: boolean
}

type HeroEngagementOrbsProps = {
  likes: string
  views: string
  className?: string
}

const TITLE_SLOTS: Omit<OrbSlot, 'value' | 'kind'>[] = [
  {
    id: 'title-view-left',
    className:
      'left-[max(-0.15rem,-1%)] top-[22%] -translate-y-1/2 sm:left-[-0.5rem] lg:left-[-1.25rem]',
    floatDuration: 5.4,
    floatDelay: 0.2,
  },
  {
    id: 'title-like-right',
    className:
      'right-[max(-0.15rem,-1%)] top-[12%] sm:right-[-0.5rem] lg:right-[-1.25rem]',
    floatDuration: 4.8,
    floatDelay: 0.55,
  },
]

function buildSlots(likes: string, views: string): OrbSlot[] {
  return [
    { ...TITLE_SLOTS[0], kind: 'view', value: views },
    { ...TITLE_SLOTS[1], kind: 'like', value: likes },
  ]
}

function EngagementOrb({
  kind,
  value,
  className,
  floatDuration,
  floatDelay,
  muted,
  reduceMotion,
}: OrbSlot & { reduceMotion: boolean }) {
  return (
    <motion.div
      className={cn(
        'absolute z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.65),0_12px_32px_-16px_rgb(0_0_0/0.18)] backdrop-blur-xl backdrop-saturate-150',
        muted
          ? 'border-[color-mix(in_srgb,var(--landing-ink)_5%,transparent)] bg-[color-mix(in_srgb,white_58%,var(--landing-canvas))] text-[color-mix(in_srgb,var(--landing-ink)_62%,transparent)]'
          : 'border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)] bg-[color-mix(in_srgb,white_78%,var(--landing-canvas))] text-[var(--landing-ink)]',
        className,
      )}
      initial={false}
      animate={
        reduceMotion
          ? { opacity: muted ? 0.88 : 1, y: 0, x: 0 }
          : {
              opacity: muted ? [0.82, 0.95, 0.82] : 1,
              y: [0, -5, 0],
              x: [0, 1.5, 0],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: floatDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: floatDelay,
            }
      }
    >
      {kind === 'like' ? (
        <Heart
          className="size-3 shrink-0 fill-[#ff375f] text-[#ff375f]"
          strokeWidth={0}
          aria-hidden
        />
      ) : (
        <Eye className="size-3 shrink-0 text-[var(--landing-muted)]" strokeWidth={2.25} aria-hidden />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          className="text-[0.6875rem] font-semibold leading-none tracking-[-0.02em] tabular-nums"
          initial={reduceMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}

export function HeroEngagementOrbs({ likes, views, className }: HeroEngagementOrbsProps) {
  const reduceMotion = useReducedMotion()
  const slots = buildSlots(likes, views)

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 hidden sm:block',
        className,
      )}
      aria-hidden="true"
    >
      {slots.map(slot => (
        <EngagementOrb key={slot.id} {...slot} reduceMotion={Boolean(reduceMotion)} />
      ))}
    </div>
  )
}
