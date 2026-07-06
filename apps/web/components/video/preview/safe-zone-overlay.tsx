'use client'

import { cn } from '@/lib/utils'

/** Safe zones for 9:16 reels (1080×1920 reference). */
const TOP_SAFE_PCT = (108 / 1920) * 100
const BOTTOM_SAFE_PCT = (320 / 1920) * 100
const SIDE_SAFE_PCT = (48 / 1080) * 100

type SafeZoneOverlayProps = {
  visible: boolean
  className?: string
}

export function SafeZoneOverlay({ visible, className }: SafeZoneOverlayProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-30 transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      aria-hidden={!visible}
    >
      {/* Top — profile / status bar area */}
      <div
        className="absolute inset-x-0 top-0 border-b border-dashed border-amber-400/70 bg-amber-400/10"
        style={{ height: `${TOP_SAFE_PCT}%` }}
      >
        <span className="absolute left-2 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-amber-100">
          UI overlay area
        </span>
      </div>

      {/* Bottom — captions / buttons / nav */}
      <div
        className="absolute inset-x-0 bottom-0 border-t border-dashed border-amber-400/70 bg-amber-400/10"
        style={{ height: `${BOTTOM_SAFE_PCT}%` }}
      >
        <span className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-amber-100">
          Captions &amp; buttons
        </span>
      </div>

      {/* Side margins — like / share buttons */}
      <div
        className="absolute inset-y-0 left-0 border-r border-dashed border-amber-400/50 bg-amber-400/5"
        style={{ width: `${SIDE_SAFE_PCT}%` }}
      />
      <div
        className="absolute inset-y-0 right-0 border-l border-dashed border-amber-400/50 bg-amber-400/5"
        style={{ width: `${SIDE_SAFE_PCT}%` }}
      />

      {/* Safe content frame */}
      <div
        className="absolute border border-dashed border-emerald-400/70"
        style={{
          top: `${TOP_SAFE_PCT}%`,
          bottom: `${BOTTOM_SAFE_PCT}%`,
          left: `${SIDE_SAFE_PCT}%`,
          right: `${SIDE_SAFE_PCT}%`,
        }}
      />
    </div>
  )
}

export function isVerticalReelsFormat(width: number, height: number): boolean {
  return height > width && Math.abs(width / height - 9 / 16) < 0.05
}
