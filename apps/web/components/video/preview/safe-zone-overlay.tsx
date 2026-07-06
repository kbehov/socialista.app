'use client'

import { cn } from '@/lib/utils'

/** Reference frame for vertical short-form safe zones. */
const REF_WIDTH = 1080
const REF_HEIGHT = 1920

type SafeZoneInsets = {
  top: number
  bottom: number
  left: number
  right: number
}

/** Safe margins on a 1080×1920 canvas (px), scaled to the project resolution. */
const SAFE_ZONE_BY_FORMAT: Record<string, SafeZoneInsets> = {
  tiktok: { top: 150, bottom: 340, left: 48, right: 168 },
  'instagram-story': { top: 180, bottom: 360, left: 48, right: 108 },
}

const DEFAULT_SAFE_ZONE: SafeZoneInsets = { top: 180, bottom: 360, left: 48, right: 168 }

function getSafeZoneInsets(
  width: number,
  height: number,
  formatId: string,
): SafeZoneInsets | null {
  if (!isVerticalReelsFormat(width, height)) return null

  const preset = SAFE_ZONE_BY_FORMAT[formatId] ?? DEFAULT_SAFE_ZONE

  const scaleX = width / REF_WIDTH
  const scaleY = height / REF_HEIGHT

  return {
    top: Math.round(preset.top * scaleY),
    bottom: Math.round(preset.bottom * scaleY),
    left: Math.round(preset.left * scaleX),
    right: Math.round(preset.right * scaleX),
  }
}

type SafeZoneOverlayProps = {
  visible: boolean
  canvasWidth: number
  canvasHeight: number
  formatId: string
  className?: string
}

export function SafeZoneOverlay({
  visible,
  canvasWidth,
  canvasHeight,
  formatId,
  className,
}: SafeZoneOverlayProps) {
  const insets = getSafeZoneInsets(canvasWidth, canvasHeight, formatId)
  if (!insets) return null

  const topPct = (insets.top / canvasHeight) * 100
  const bottomPct = (insets.bottom / canvasHeight) * 100
  const leftPct = (insets.left / canvasWidth) * 100
  const rightPct = (insets.right / canvasWidth) * 100

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-30 transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
        !visible && 'invisible',
        className,
      )}
      aria-hidden={!visible}
    >
      <div
        className="absolute inset-x-0 top-0 bg-black/20"
        style={{ height: `${topPct}%` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-black/20"
        style={{ height: `${bottomPct}%` }}
      />
      <div
        className="absolute left-0 bg-black/15"
        style={{
          top: `${topPct}%`,
          bottom: `${bottomPct}%`,
          width: `${leftPct}%`,
        }}
      />
      <div
        className="absolute right-0 bg-black/15"
        style={{
          top: `${topPct}%`,
          bottom: `${bottomPct}%`,
          width: `${rightPct}%`,
        }}
      />

      <div
        className="absolute ring-1 ring-inset ring-white/45"
        style={{
          top: `${topPct}%`,
          bottom: `${bottomPct}%`,
          left: `${leftPct}%`,
          right: `${rightPct}%`,
        }}
      />
    </div>
  )
}

export function isVerticalReelsFormat(width: number, height: number): boolean {
  if (height <= width) return false
  return Math.abs(width / height - 9 / 16) < 0.05
}
