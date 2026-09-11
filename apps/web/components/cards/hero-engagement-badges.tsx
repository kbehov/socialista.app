'use client'

import { Eye, Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type BadgeKind = 'like' | 'view'

type FloatingBadge = {
  id: number
  kind: BadgeKind
  label: string
  left: string
  bottom: string
  durationMs: number
  delayMs: number
}

type HeroEngagementBadgesProps = {
  activeIndex: number
  slides: readonly { likes: string; views: string }[]
  reduceMotion: boolean
}

export function HeroEngagementBadges({
  activeIndex,
  slides,
  reduceMotion,
}: HeroEngagementBadgesProps) {
  const [badges, setBadges] = useState<FloatingBadge[]>([])
  const activeRef = useRef(activeIndex)
  const badgeIdRef = useRef(0)

  useEffect(() => {
    activeRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    if (reduceMotion) return

    let timeout = 0
    let cancelled = false

    const spawn = () => {
      if (cancelled) return
      const slide = slides[activeRef.current]
      if (!slide) return

      const kind: BadgeKind = Math.random() > 0.42 ? 'like' : 'view'
      const onLeft = Math.random() > 0.5
      const badge: FloatingBadge = {
        id: ++badgeIdRef.current,
        kind,
        label: kind === 'like' ? slide.likes : slide.views,
        left: onLeft ? `${2 + Math.random() * 11}%` : `${82 + Math.random() * 13}%`,
        bottom: `${7 + Math.random() * 20}%`,
        durationMs: 3200 + Math.random() * 1400,
        delayMs: Math.random() * 240,
      }

      setBadges(current => [...current.slice(-3), badge])
      timeout = window.setTimeout(spawn, 850 + Math.random() * 1250)
    }

    timeout = window.setTimeout(spawn, 380)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [reduceMotion, slides])

  useEffect(() => {
    if (reduceMotion) return
    const slide = slides[activeIndex]
    if (!slide) return

    const burst: FloatingBadge[] = [
      {
        id: ++badgeIdRef.current,
        kind: 'like',
        label: slide.likes,
        left: `${84 + Math.random() * 8}%`,
        bottom: `${10 + Math.random() * 8}%`,
        durationMs: 3600,
        delayMs: 80,
      },
      {
        id: ++badgeIdRef.current,
        kind: 'view',
        label: slide.views,
        left: `${3 + Math.random() * 8}%`,
        bottom: `${14 + Math.random() * 10}%`,
        durationMs: 4000,
        delayMs: 160,
      },
    ]

    setBadges(current => [...current.slice(-2), ...burst])
  }, [activeIndex, reduceMotion, slides])

  if (reduceMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {badges.map(badge => (
        <div
          key={badge.id}
          className="absolute flex items-center gap-1.5 rounded-full border border-black/5 bg-white/[0.95] px-3 py-1.5 text-sm font-semibold tracking-[-0.02em] text-[#111] shadow-[0_8px_18px_-12px_rgb(0_0_0/0.4)] backdrop-blur-sm animate-hero-badge-float opacity-0"
          style={{
            left: badge.left,
            bottom: badge.bottom,
            animationDuration: `${badge.durationMs}ms`,
            animationDelay: `${badge.delayMs}ms`,
          }}
          onAnimationEnd={() => {
            setBadges(current => current.filter(item => item.id !== badge.id))
          }}
        >
          {badge.kind === 'like' ? (
            <Heart className="size-[0.9rem] fill-[#ff375f] text-[#ff375f]" strokeWidth={0} />
          ) : (
            <Eye className="size-[0.95rem] text-black/70" strokeWidth={2} />
          )}
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
