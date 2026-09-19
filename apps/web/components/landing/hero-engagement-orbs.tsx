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
    muted: true,
  },
  {
    id: 'title-like-right',
    className:
      'right-[max(-0.15rem,-1%)] top-[12%] sm:right-[-0.5rem] lg:right-[-1.25rem]',
    floatDuration: 4.8,
    floatDelay: 0.55,
  },
  {
    id: 'title-like-mid-right',
    className:
      'right-[max(0rem,0%)] bottom-[18%] sm:right-[-0.35rem]',
    floatDuration: 5.1,
    floatDelay: 0.85,
    muted: true,
  },
]

function accentLikeCount(likes: string): string {
  const match = likes.match(/^([\d.]+)K$/i)
  if (!match) return likes
  const value = Number.parseFloat(match[1]!)
  if (!Number.isFinite(value)) return likes
  const accent = Math.max(9.6, Math.round(value * 0.12 * 10) / 10)
  return `${accent.toFixed(1)}K`
}

function buildSlots(likes: string, views: string): OrbSlot[] {
  return [
    { ...TITLE_SLOTS[0], kind: 'view', value: views },
    { ...TITLE_SLOTS[1], kind: 'like', value: likes },
    { ...TITLE_SLOTS[2], kind: 'like', value: accentLikeCount(likes) },
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
        'absolute z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 shadow-[0_10px_28px_-14px_rgb(0_0_0/0.22)] backdrop-blur-md',
        muted
          ? 'border-black/[0.04] bg-white/72 text-black/62'
          : 'border-black/[0.06] bg-white/[0.96] text-[#111]',
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
        <Eye className="size-3 shrink-0 text-black/55" strokeWidth={2.25} aria-hidden />
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
