import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Clapperboard,
  Film,
  GalleryHorizontal,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Mic,
  PackageOpen,
  PenLine,
  Smartphone,
  Sparkles,
  Subtitles,
  Users,
  Video,
  WandSparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { FEATURE_MARQUEE } from './content'
import { FadeIn } from './fade-in'

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'UGC Studio': Smartphone,
  'Static Ads': LayoutTemplate,
  Kling: Clapperboard,
  Captions: Subtitles,
  Slideshows: GalleryHorizontal,
  'GPT Image': ImageIcon,
  Influencers: Users,
  Seedream: Sparkles,
  'Image Studio': WandSparkles,
  Seedance: Film,
  Unboxing: PackageOpen,
  'Video Studio': Video,
  Composer: PenLine,
  'Brand Voice': Megaphone,
  Flux: Zap,
  'Talking Clips': Mic,
  Analytics: BarChart3,
  Sora: Sparkles,
}

function MarqueeFade({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 w-12 sm:w-20',
        side === 'left'
          ? 'left-0 bg-gradient-to-r from-background to-transparent'
          : 'right-0 bg-gradient-to-l from-background to-transparent',
      )}
    />
  )
}

function FeaturePill({ label }: { label: string }) {
  const Icon = FEATURE_ICONS[label] ?? Sparkles

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-sm font-medium tracking-[-0.01em] text-foreground/85 sm:px-4 sm:py-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground sm:size-4" strokeWidth={2} />
      <span>{label}</span>
    </div>
  )
}

function FeatureMarqueeRow({
  items,
  reverse = false,
  durationClass,
}: {
  items: readonly string[]
  reverse?: boolean
  durationClass: string
}) {
  return (
    <div className="relative">
      <MarqueeFade side="left" />
      <MarqueeFade side="right" />
      <Marquee
        reverse={reverse}
        pauseOnHover
        repeat={4}
        className={cn('p-0 py-1 [--gap:0.625rem] sm:[--gap:0.75rem]', durationClass)}
      >
        {items.map(label => (
          <FeaturePill key={label} label={label} />
        ))}
      </Marquee>
    </div>
  )
}

export function LandingFeatureMarquee() {
  return (
    <section
      aria-label="Studio features and AI models"
      className="overflow-x-clip pt-5 pb-8 sm:pt-6 sm:pb-10"
    >
      <FadeIn delay={0.06} immediate className="space-y-2.5 sm:space-y-3">
        <FeatureMarqueeRow
          items={FEATURE_MARQUEE.rowA}
          durationClass="[--duration:46s]"
        />
        <FeatureMarqueeRow
          items={FEATURE_MARQUEE.rowB}
          reverse
          durationClass="[--duration:54s]"
        />
      </FadeIn>
    </section>
  )
}
