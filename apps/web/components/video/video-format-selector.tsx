'use client'

import { PlatformIcon } from '@/components/carousel/format-selector'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import { formatAspectRatio, type AspectRatioPreset } from '@/lib/carousel/aspect-ratios'
import {
  VIDEO_FORMAT_PRESETS,
  type VideoFormatPresetId,
} from '@/lib/video/format-presets'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'

function FormatOption({ preset, className }: { preset: AspectRatioPreset; className?: string }) {
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

function FormatTriggerLabel({ preset }: { preset: AspectRatioPreset }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
      <PlatformIcon platform={preset.platform} size={14} />
      <span className="min-w-0 truncate text-xs font-medium leading-none">
        {preset.platform}
        <span className="font-normal text-muted-foreground"> · {preset.label}</span>
        <span className="font-normal text-muted-foreground">
          {' '}
          · {preset.dimensions.width}×{preset.dimensions.height}
        </span>
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
  const activePreset =
    VIDEO_FORMAT_PRESETS.find(p => p.id === formatPresetId) ?? VIDEO_FORMAT_PRESETS[0]!
  const platforms = [...new Set(VIDEO_FORMAT_PRESETS.map(preset => preset.platform))]

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {showLabel ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Export format
        </span>
      ) : null}
      <Select
        value={formatPresetId}
        onValueChange={id => setFormatPreset(id as VideoFormatPresetId)}
      >
        <SelectTrigger
          size="sm"
          aria-label={`Format: ${activePreset.platform} ${activePreset.label}`}
          className="h-8 w-full min-w-0 max-w-full gap-1 overflow-hidden py-0 pl-2 pr-1.5 data-[size=sm]:h-8"
        >
          <FormatTriggerLabel preset={activePreset} />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="end" sideOffset={6} className="min-w-[280px]">
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
