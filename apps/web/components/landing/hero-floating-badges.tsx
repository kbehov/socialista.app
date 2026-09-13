'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { PlatformId } from '@/components/landing/content'
import { motion, useReducedMotion } from 'motion/react'

type HeroFloatingBadgeSlot = 'top-left' | 'mid-left' | 'mid-right'

type HeroFloatingBadge = {
  platform: PlatformId
  views: string
  likes: string
  slot: HeroFloatingBadgeSlot
}

type HeroFloatingBadgesProps = {
  badges: HeroFloatingBadge[]
  active: boolean
}

const SLOT_CLASS: Record<HeroFloatingBadgeSlot, string> = {
  'top-left': 'top-[17%] left-0 -translate-x-[calc(100%+0.625rem)]',
  'mid-left': 'top-[43%] left-0 -translate-x-[calc(100%+0.625rem)]',
  'mid-right': 'top-[30%] right-0 translate-x-[calc(100%+0.625rem)]',
}

const FLOAT_DELAY: Record<HeroFloatingBadgeSlot, number> = {
  'top-left': 0,
  'mid-left': 0.35,
  'mid-right': 0.18,
}

export function HeroFloatingBadges({ badges, active }: HeroFloatingBadgesProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 z-40 hidden sm:block" aria-hidden="true">
      {badges.map(badge => (
        <motion.div
          key={badge.platform}
          className={cn(
            'absolute flex max-w-[11.5rem] items-center gap-2.5 rounded-2xl border border-white/80 bg-white/88 px-3.5 py-2.5 backdrop-blur-xl',
            SLOT_CLASS[badge.slot],
          )}
          initial={false}
          animate={
            reduceMotion || !active
              ? { opacity: 1, y: 0 }
              : { opacity: 1, y: [0, -2, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 5.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: FLOAT_DELAY[badge.slot],
                }
          }
        >
          <SocialPlatformIcon
            provider={badge.platform}
            size={18}
            framed
            className="size-9 shrink-0 rounded-[0.6rem]"
          />
          <div className="min-w-0 leading-none">
            <p className="truncate text-[0.75rem] font-semibold tracking-[-0.02em] text-foreground tabular-nums">
              {badge.views}
              <span className="font-medium text-muted-foreground"> views</span>
            </p>
            <p className="mt-1.5 truncate text-[0.75rem] tracking-[-0.01em] text-muted-foreground tabular-nums">
              {badge.likes}
              <span> likes</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
