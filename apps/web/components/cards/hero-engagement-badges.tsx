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
  likes: string
  views: string
  active: boolean
  reduceMotion: boolean
}

export function HeroEngagementBadges({
  likes,
  views,
  active,
  reduceMotion,
}: HeroEngagementBadgesProps) {
  const [badges, setBadges] = useState<FloatingBadge[]>([])
  const badgeIdRef = useRef(0)
  const statsRef = useRef({ likes, views })

  useEffect(() => {
    statsRef.current = { likes, views }
  }, [likes, views])

  useEffect(() => {
    if (!active) {
      setBadges([])
    }
  }, [active])

  useEffect(() => {
    if (reduceMotion || !active) return

    let timeout = 0
    let cancelled = false

    const spawn = () => {
      if (cancelled) return

      const kind: BadgeKind = Math.random() > 0.42 ? 'like' : 'view'
      const onLeft = Math.random() > 0.5
      const badge: FloatingBadge = {
        id: ++badgeIdRef.current,
        kind,
        label: kind === 'like' ? statsRef.current.likes : statsRef.current.views,
        left: onLeft ? `${6 + Math.random() * 14}%` : `${68 + Math.random() * 14}%`,
        bottom: `${12 + Math.random() * 20}%`,
        durationMs: 3200 + Math.random() * 1400,
        delayMs: Math.random() * 240,
      }

      setBadges(current => [...current.slice(-2), badge])
      timeout = window.setTimeout(spawn, 850 + Math.random() * 1250)
    }

    const burst: FloatingBadge[] = [
      {
        id: ++badgeIdRef.current,
        kind: 'like',
        label: likes,
        left: `${72 + Math.random() * 10}%`,
        bottom: `${14 + Math.random() * 8}%`,
        durationMs: 3600,
        delayMs: 80,
      },
      {
        id: ++badgeIdRef.current,
        kind: 'view',
        label: views,
        left: `${8 + Math.random() * 10}%`,
        bottom: `${18 + Math.random() * 8}%`,
        durationMs: 4000,
        delayMs: 160,
      },
    ]

    setBadges(burst)
    timeout = window.setTimeout(spawn, 900)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [active, reduceMotion, likes, views])

  if (reduceMotion || !active) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[20] overflow-hidden" aria-hidden="true">
      {badges.map(badge => (
        <div
          key={badge.id}
          className="absolute flex max-w-[46%] items-center gap-0.5 rounded-full border border-black/5 bg-white/[0.95] px-1.5 py-0.5 text-[0.5625rem] font-semibold leading-none tracking-[-0.02em] text-[#111] shadow-[0_4px_10px_-8px_rgb(0_0_0/0.45)] backdrop-blur-sm animate-hero-badge-float opacity-0"
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
            <Heart className="size-[0.5rem] shrink-0 fill-[#ff375f] text-[#ff375f]" strokeWidth={0} />
          ) : (
            <Eye className="size-[0.52rem] shrink-0 text-black/70" strokeWidth={2} />
          )}
          <span className="truncate">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
