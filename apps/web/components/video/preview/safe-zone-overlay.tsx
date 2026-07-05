'use client'

import { cn } from '@/lib/utils'

/** Safe zones for 9:16 reels (1080×1920 reference). */
const TOP_SAFE_PCT = (108 / 1920) * 100
const BOTTOM_SAFE_PCT = (320 / 1920) * 100

type SafeZoneOverlayProps = {
  visible: boolean
  className?: string
}

export function SafeZoneOverlay({ visible, className }: SafeZoneOverlayProps) {
  if (!visible) return null

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 z-10', className)}
      aria-hidden
    >
      <div
        className="absolute inset-x-0 top-0 border-b border-dashed border-yellow-400/70 bg-yellow-400/5"
        style={{ height: `${TOP_SAFE_PCT}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-yellow-400/70 bg-yellow-400/5"
        style={{ height: `${BOTTOM_SAFE_PCT}%` }}
      />
      <div className="absolute left-1 top-1 rounded bg-black/50 px-1 py-0.5 text-[9px] text-yellow-200">
        Safe zone
      </div>
    </div>
  )
}

export function isVerticalReelsFormat(width: number, height: number): boolean {
  return height > width && Math.abs(width / height - 9 / 16) < 0.05
}
