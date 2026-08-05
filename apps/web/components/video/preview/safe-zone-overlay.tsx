'use client'

import { getVideoFormatPreset } from '@/lib/video/format-presets'
import { useVideoEditorStore } from '@/lib/video/store'

/** Renders platform UI dead-zone guides over the preview artboard. */
export function SafeZoneOverlay() {
  const showSafeZones = useVideoEditorStore(s => s.showSafeZones)
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const preset = getVideoFormatPreset(formatPresetId)
  const zone = preset?.safeZone

  if (!showSafeZones || !zone) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
      {/* Top dead zone */}
      <div
        className="absolute inset-x-0 top-0 bg-primary/10"
        style={{ height: `${zone.top}%` }}
      />
      {/* Bottom dead zone */}
      <div
        className="absolute inset-x-0 bottom-0 bg-primary/10"
        style={{ height: `${zone.bottom}%` }}
      />
      {/* Left */}
      <div
        className="absolute inset-y-0 left-0 bg-primary/5"
        style={{
          width: `${zone.left}%`,
          top: `${zone.top}%`,
          bottom: `${zone.bottom}%`,
        }}
      />
      {/* Right */}
      <div
        className="absolute inset-y-0 right-0 bg-primary/5"
        style={{
          width: `${zone.right}%`,
          top: `${zone.top}%`,
          bottom: `${zone.bottom}%`,
        }}
      />
      {/* Safe area border */}
      <div
        className="absolute border border-dashed border-primary/40"
        style={{
          top: `${zone.top}%`,
          bottom: `${zone.bottom}%`,
          left: `${zone.left}%`,
          right: `${zone.right}%`,
        }}
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-md border border-border/50 bg-background/95 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm"
        style={{ top: `calc(${zone.top}% + 4px)` }}
      >
        {preset.platform} safe area
      </span>
    </div>
  )
}
