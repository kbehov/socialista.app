'use client'

import type { ComponentType } from 'react'
import { FacebookIcon } from '@/components/icons/facebook-icon'
import { InstagramIcon } from '@/components/icons/instagram-icon'
import { LinkedInIcon } from '@/components/icons/linkedin-icon'
import type { SocialIconProps } from '@/components/icons/types'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { XIcon } from '@/components/icons/x-icon'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import {
  ASPECT_RATIO_PRESETS,
  formatAspectRatio,
  getAspectRatioPreset,
  type AspectRatioPreset,
} from '@/lib/carousel/aspect-ratios'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'

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

function PlatformIcon({
  platform,
  className,
  size = 16,
}: {
  platform: string
  className?: string
  size?: number
}) {
  const Icon = PLATFORM_ICONS[platform]
  if (!Icon) {
    return (
      <span
        className={cn('flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold', className)}
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
  compact = false,
  className,
}: {
  preset: AspectRatioPreset
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <PlatformIcon platform={preset.platform} />
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-medium leading-none">
          {preset.platform}
          {!compact ? <span className="font-normal text-muted-foreground"> · {preset.label}</span> : null}
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

export function FormatSelector({ className }: { className?: string }) {
  const aspectRatioId = useEditorStore(s => s.aspectRatioId)
  const setAspectRatio = useEditorStore(s => s.setAspectRatio)
  const activePreset = getAspectRatioPreset(aspectRatioId)
  const platforms = [...new Set(ASPECT_RATIO_PRESETS.map(preset => preset.platform))]

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Format
      </span>
      <Select value={aspectRatioId} onValueChange={setAspectRatio}>
        <SelectTrigger
          size="sm"
          aria-label={`Format: ${activePreset.platform} ${activePreset.label}, ${activePreset.dimensions.width} by ${activePreset.dimensions.height}`}
          className="h-auto w-full min-w-[220px] gap-2 px-3 py-2.5 sm:min-w-[240px]"
        >
          <FormatOption preset={activePreset} compact className="min-w-0 flex-1 px-1 py-0.5" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="end"
          sideOffset={6}
          className="min-w-[280px]"
        >
          {platforms.map(platform => (
            <SelectGroup key={platform}>
              <SelectLabel className="flex items-center gap-2 px-2 py-1.5">
                <PlatformIcon platform={platform} size={14} />
                {platform}
              </SelectLabel>
              {ASPECT_RATIO_PRESETS.filter(preset => preset.platform === platform).map(preset => (
                <SelectItem key={preset.id} value={preset.id} className="py-2.5 pl-3">
                  <FormatOption preset={preset} />
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
