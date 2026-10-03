'use client'

import {
  AudioLines,
  Aperture,
  Captions,
  Eraser,
  FileText,
  Film,
  Frame,
  ImageIcon,
  LayoutTemplate,
  Mic,
  PackageOpen,
  PersonStanding,
  ScanLine,
  Shuffle,
  Sparkles,
  UserRoundCog,
  Video,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useReducedMotion } from 'motion/react'

import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

import {
  landingSection,
  landingSectionAlt,
  landingSectionDivider,
  landingSupportingContentGap,
  landingSupportingSectionY,
  landingSupportingTitle,
} from './landing-classes'

type FeatureChip = {
  id: string
  label: string
  icon: LucideIcon
}

const FEATURE_ROW_PRIMARY: FeatureChip[] = [
  { id: 'background-remover', label: 'Background Remover', icon: Eraser },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'swap-actor', label: 'Swap Actor', icon: Shuffle },
  { id: 'nano-banana', label: 'Nano Banana', icon: Sparkles },
  { id: 'camera-angle', label: 'Camera Angle', icon: Aperture },
  { id: 'sora-2-pro', label: 'Sora 2 Pro', icon: Film },
  { id: 'talking-actors', label: 'Talking Actors', icon: Mic },
  { id: 'gpt-image', label: 'GPT Image', icon: ImageIcon },
  { id: 'change-voices', label: 'Change Voices', icon: AudioLines },
  { id: 'slideshows', label: 'Slideshows', icon: Frame },
]

const FEATURE_ROW_SECONDARY: FeatureChip[] = [
  { id: 'ugc-studio', label: 'UGC Studio', icon: Video },
  { id: 'unboxing', label: 'Unboxing', icon: PackageOpen },
  { id: 'replace-actor', label: 'Replace Actor', icon: UserRoundCog },
  { id: 'seedance', label: 'Seedance 2.5', icon: Wand2 },
  { id: 'extract-frame', label: 'Extract Frame', icon: ScanLine },
  { id: 'transcribe', label: 'Transcribe', icon: FileText },
  { id: 'animate-actor', label: 'Animate Actor', icon: PersonStanding },
  { id: 'static-ads', label: 'Static Ads', icon: LayoutTemplate },
  { id: 'nano-banana-2', label: 'Nano Banana', icon: Sparkles },
  { id: 'kling', label: 'Kling', icon: Zap },
]

const MARQUEE_ROWS = [
  {
    items: FEATURE_ROW_PRIMARY,
    reverse: false,
    durationClass: '[--duration:54s]',
    offset: 0,
  },
  {
    items: FEATURE_ROW_SECONDARY,
    reverse: true,
    durationClass: '[--duration:62s]',
    offset: 3,
  },
] as const

function rotateFeatures(items: readonly FeatureChip[], offset: number) {
  if (items.length === 0) return []
  const len = items.length
  const start = offset % len
  return [...items.slice(start), ...items.slice(0, start)]
}

function FeaturePill({ label, icon: Icon }: FeatureChip) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2.5 rounded-full',
        'border border-[color-mix(in_srgb,var(--landing-ink)_8%,transparent)]',
        'bg-[color-mix(in_srgb,white_94%,var(--landing-canvas))]',
        'px-4 py-2.5 sm:px-[1.125rem] sm:py-[0.6875rem]',
        'shadow-[0_1px_2px_color-mix(in_oklch,var(--landing-ink)_4%,transparent),inset_0_1px_0_0_oklch(1_0_0/0.85)]',
        'select-none whitespace-nowrap',
      )}
    >
      <Icon
        className="size-4 shrink-0 text-[var(--landing-ink)]"
        strokeWidth={1.625}
        aria-hidden="true"
      />
      <span className="text-[0.8125rem] font-medium leading-none tracking-[-0.02em] text-[var(--landing-ink)] sm:text-[0.875rem]">
        {label}
      </span>
    </span>
  )
}

function FeatureMarqueeRow({
  items,
  reverse,
  durationClass,
  offset,
  staticRow,
}: {
  items: readonly FeatureChip[]
  reverse: boolean
  durationClass: string
  offset: number
  staticRow: boolean
}) {
  const chips = rotateFeatures(items, offset).map(feature => (
    <FeaturePill key={`${offset}-${feature.id}`} {...feature} />
  ))

  if (staticRow) {
    return (
      <div className="flex justify-center gap-2.5 overflow-hidden px-4 sm:gap-3">{chips}</div>
    )
  }

  return (
    <Marquee
      reverse={reverse}
      repeat={2}
      pauseOnHover
      className={cn('w-full p-0 [--gap:0.625rem] sm:[--gap:0.75rem]', durationClass)}
    >
      {chips}
    </Marquee>
  )
}

export function LandingFeaturesMarquee() {
  const reduceMotion = useReducedMotion()
  const staticRow = Boolean(reduceMotion)

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className={cn(
        'scroll-mt-24',
        landingSupportingSectionY,
        landingSectionDivider,
        landingSectionAlt,
      )}
    >
      <div className={landingSection}>
        <h2 id="features-heading" className={landingSupportingTitle}>
          All you need to dominate social media
        </h2>
      </div>

      <div
        className={cn(
          landingSupportingContentGap,
          'relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-2.5 sm:gap-3',
            '[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]',
            'sm:[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]',
            'lg:[mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]',
          )}
        >
          {MARQUEE_ROWS.map(row => (
            <FeatureMarqueeRow
              key={row.durationClass}
              items={row.items}
              reverse={row.reverse}
              durationClass={row.durationClass}
              offset={row.offset}
              staticRow={staticRow}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
