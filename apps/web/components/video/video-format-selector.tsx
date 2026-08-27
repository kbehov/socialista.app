'use client'

import { useEffect, useRef } from 'react'
import { PlatformIcon } from '@/components/carousel/format-selector'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import { formatAspectRatio } from '@/lib/carousel/aspect-ratios'
import {
  VIDEO_FORMAT_PRESETS,
  getVideoFormatPreset,
  type VideoFormatPreset,
  type VideoFormatPresetId,
} from '@/lib/video/format-presets'
import { useVideoEditorStore } from '@/lib/video/store'
import { VIDEO_FOCUS_FORMAT_EVENT } from '@/lib/video/editor-events'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const SAFE_ZONE_NUDGE_KEY = 'video-safe-zone-nudge:v1'

function maybeNudgeSafeZones(presetId: VideoFormatPresetId) {
  const preset = getVideoFormatPreset(presetId)
  if (!preset?.safeZone) return
  const state = useVideoEditorStore.getState()
  if (state.showSafeZones) return
  try {
    if (localStorage.getItem(SAFE_ZONE_NUDGE_KEY) === 'done') return
    localStorage.setItem(SAFE_ZONE_NUDGE_KEY, 'done')
  } catch {
    // still show once per session if storage blocked
  }
  toast.message(`${preset.platform} hides UI near the edges`, {
    description: 'Enable safe zones to keep important content visible.',
    action: {
      label: 'Enable',
      onClick: () => useVideoEditorStore.getState().setShowSafeZones(true),
    },
  })
}

function FormatOption({ preset, className }: { preset: VideoFormatPreset; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <PlatformIcon platform={preset.platform} />
      <div className="min-w-0 flex-1 overflow-hidden text-left">
        <p className="truncate text-sm font-medium leading-none">
          {preset.platform}
          <span className="font-normal text-muted-foreground"> · {preset.label}</span>
        </p>
        <p className="mt-1 truncate text-[11px] tabular-nums text-muted-foreground">
          {preset.dimensions.width}×{preset.dimensions.height}
          <span className="mx-1">·</span>
          {formatAspectRatio(preset.dimensions)}
        </p>
      </div>
    </div>
  )
}

function FormatTriggerLabel({ preset }: { preset: VideoFormatPreset }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
      <PlatformIcon platform={preset.platform} size={14} />
      <span className="min-w-0 truncate text-xs font-medium leading-none">
        {preset.platform}
        <span className="font-normal text-muted-foreground"> · {preset.label}</span>
      </span>
    </div>
  )
}

export function VideoFormatSelector({
  className,
  showLabel = true,
}: {
  className?: string
  showLabel?: boolean
}) {
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const setFormatPreset = useVideoEditorStore(s => s.setFormatPreset)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activePreset =
    VIDEO_FORMAT_PRESETS.find(p => p.id === formatPresetId) ?? VIDEO_FORMAT_PRESETS[0]!
  const platforms = [...new Set(VIDEO_FORMAT_PRESETS.map(preset => preset.platform))]

  useEffect(() => {
    const focusFormat = () => {
      triggerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      triggerRef.current?.focus()
    }
    window.addEventListener(VIDEO_FOCUS_FORMAT_EVENT, focusFormat)
    return () => window.removeEventListener(VIDEO_FOCUS_FORMAT_EVENT, focusFormat)
  }, [])

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {showLabel ? (
        <span className="text-[11px] font-medium text-muted-foreground">Format</span>
      ) : null}
      <Select
        value={formatPresetId}
        onValueChange={id => {
          const next = id as VideoFormatPresetId
          setFormatPreset(next)
          maybeNudgeSafeZones(next)
        }}
      >
        <SelectTrigger
          ref={triggerRef}
          data-video-format-selector
          size="sm"
          aria-label={`Format: ${activePreset.platform} ${activePreset.label}`}
          className="h-7 w-full min-w-0 max-w-full gap-1 overflow-hidden py-0 pl-2 pr-1.5 text-xs data-[size=sm]:h-7"
        >
          <FormatTriggerLabel preset={activePreset} />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="end" sideOffset={6} className="min-w-70">
          {platforms.map(platform => (
            <SelectGroup key={platform}>
              <SelectLabel className="flex items-center gap-2 px-2 py-1.5">
                <PlatformIcon platform={platform} size={14} />
                {platform}
              </SelectLabel>
              {VIDEO_FORMAT_PRESETS.filter(preset => preset.platform === platform).map(preset => (
                <SelectItem key={preset.id} value={preset.id} className="py-2 pl-3">
                  <FormatOption preset={preset} className="py-1" />
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function VideoResolutionBadge({ className }: { className?: string }) {
  const resolution = useVideoEditorStore(s => s.project.resolution)
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const preset =
    VIDEO_FORMAT_PRESETS.find(p => p.id === formatPresetId) ?? VIDEO_FORMAT_PRESETS[0]!

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <PlatformIcon platform={preset.platform} size={12} className="size-4" />
      <span className="tabular-nums">
        {resolution.width}×{resolution.height}
      </span>
    </span>
  )
}
