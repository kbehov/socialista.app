'use client'

import { FacebookIcon } from '@/components/icons/facebook-icon'
import { InstagramIcon } from '@/components/icons/instagram-icon'
import { LinkedInIcon } from '@/components/icons/linkedin-icon'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import type { SocialIconProps } from '@/components/icons/types'
import { XIcon } from '@/components/icons/x-icon'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from '@/components/ui/select'
import {
  ASPECT_RATIO_PRESETS,
  formatAspectRatio,
  getAspectRatioPreset,
  type AspectRatioPreset,
} from '@/lib/carousel/aspect-ratios'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

const PLATFORM_ICONS: Record<string, ComponentType<SocialIconProps>> = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  LinkedIn: LinkedInIcon,
  X: XIcon,
  Facebook: FacebookIcon,
}

const PLATFORM_ACCENTS: Record<string, string> = {
  Instagram: 'bg-gradient-to-br from-[#f9ce34]/20 via-[#ee2a7b]/15 to-[#6228d7]/20 text-[#ee2a7b]',
  TikTok: 'bg-foreground/5 text-foreground',
  LinkedIn: 'bg-[#0a66c2]/10 text-[#0a66c2]',
  X: 'bg-foreground/5 text-foreground',
  Facebook: 'bg-[#1877f2]/10 text-[#1877f2]',
}

function PlatformIcon({ platform, className, size = 16 }: { platform: string; className?: string; size?: number }) {
  const Icon = PLATFORM_ICONS[platform]
  if (!Icon) {
    return (
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold',
          className,
        )}
      >
        {platform.charAt(0)}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md',
        PLATFORM_ACCENTS[platform] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <Icon size={size} />
    </span>
  )
}

function FormatOption({
  preset,
  className,
}: {
  preset: AspectRatioPreset
  className?: string
}) {
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
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden py-0.5">
      <PlatformIcon platform={preset.platform} />
      <div className="min-w-0 flex-1 overflow-hidden text-left">
        <p className="truncate text-sm font-medium leading-tight">
          {preset.platform}
          <span className="font-normal text-muted-foreground"> · {preset.label}</span>
        </p>
        <p className="truncate text-[11px] leading-tight tabular-nums text-muted-foreground">
          {preset.dimensions.width}×{preset.dimensions.height}
          <span className="mx-1">·</span>
          {formatAspectRatio(preset.dimensions)}
        </p>
      </div>
    </div>
  )
}

export function FormatSelector({ className }: { className?: string }) {
  const aspectRatioId = useEditorStore(s => s.aspectRatioId)
  const setAspectRatio = useEditorStore(s => s.setAspectRatio)
  const activePreset = getAspectRatioPreset(aspectRatioId)
  const platforms = [...new Set(ASPECT_RATIO_PRESETS.map(preset => preset.platform))]

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Format</span>
      <Select value={aspectRatioId} onValueChange={setAspectRatio}>
        <SelectTrigger
          size="sm"
          aria-label={`Format: ${activePreset.platform} ${activePreset.label}, ${activePreset.dimensions.width} by ${activePreset.dimensions.height}`}
          className="h-auto min-h-8 w-full min-w-0 max-w-full gap-2 overflow-hidden whitespace-normal py-1.5 pl-2.5 pr-2 data-[size=sm]:h-auto"
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
              {ASPECT_RATIO_PRESETS.filter(preset => preset.platform === platform).map(preset => (
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

export function AspectRatioBadge({ className }: { className?: string }) {
  const canvas = useEditorStore(s => s.canvas)
  const aspectRatioId = useEditorStore(s => s.aspectRatioId)
  const preset = getAspectRatioPreset(aspectRatioId)

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <PlatformIcon platform={preset.platform} size={12} className="size-4" />
      <span className="tabular-nums">
        {canvas.width}×{canvas.height}
      </span>
    </span>
  )
}
