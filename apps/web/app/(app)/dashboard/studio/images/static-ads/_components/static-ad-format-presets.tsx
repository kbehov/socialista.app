'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { commitHaptic } from '@/utils/haptics'
import {
  BoxIcon,
  CameraIcon,
  CirclePlayIcon,
  DumbbellIcon,
  HandIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  PackageOpenIcon,
  SparklesIcon,
  SplitIcon,
  UserRoundIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'
import {
  STATIC_AD_FORMAT_PRESETS,
  type StaticAdFormatPresetId,
} from '../_lib/format-presets'
import { useStaticAdStudio } from './static-ad-studio-provider'

const PRESET_ICONS: Record<StaticAdFormatPresetId, LucideIcon> = {
  'ugc-hold': HandIcon,
  'ugc-fitness': DumbbellIcon,
  'ugc-selfie': CameraIcon,
  unboxing: PackageOpenIcon,
  'demo-use': CirclePlayIcon,
  'flat-lay': LayoutGridIcon,
  'lifestyle-ritual': SparklesIcon,
  'product-hero': BoxIcon,
  'reaction-hook': ZapIcon,
  'direct-response': MegaphoneIcon,
  'testimonial-ugc': UserRoundIcon,
  'before-after-safe': SplitIcon,
}

export function StaticAdFormatPresets() {
  const { applyFormatPreset, activePresetId } = useStaticAdStudio()

  return (
    <div className="min-w-0 space-y-2">
      <div className="min-w-0 px-0.5">
        <p className="text-[12px] font-medium tracking-[-0.01em] text-foreground">
          Format presets
        </p>
        <p className="text-[11px] text-muted-foreground">
          Tap to fill creative direction — edit anytime.
        </p>
      </div>

      <ScrollArea className="w-full min-w-0 whitespace-nowrap pb-2.5">
        <div
          className="flex w-max gap-1.5"
          role="listbox"
          aria-label="Creative format presets"
        >
          {STATIC_AD_FORMAT_PRESETS.map(preset => {
            const Icon = PRESET_ICONS[preset.id] ?? SparklesIcon
            const isActive = activePresetId === preset.id

            return (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={isActive}
                title={preset.description}
                onClick={() => {
                  applyFormatPreset(preset)
                  commitHaptic({ vibrateDuration: 8 })
                }}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5',
                  'text-[11px] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform]',
                  'duration-150 active:scale-[0.97]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive
                    ? 'border-foreground/20 bg-foreground text-background shadow-sm'
                    : 'border-border/50 bg-background/90 text-muted-foreground shadow-xs hover:border-border hover:bg-muted/30 hover:text-foreground',
                )}
              >
                <Icon className="size-3 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
                <span>{preset.label}</span>
                {preset.trending ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.04em]',
                      isActive
                        ? 'bg-background/15 text-background'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
                    )}
                  >
                    Hot
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
