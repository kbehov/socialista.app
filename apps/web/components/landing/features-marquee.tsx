import { Badge } from '@/components/ui/badge'
import { Marquee } from '@/components/ui/marquee'
import {
  AudioLines,
  Captions,
  Clapperboard,
  ImageIcon,
  Layers3,
  Mic,
  Sparkles,
  UserRound,
  Video,
  Wand2,
  type LucideIcon,
} from 'lucide-react'

import { FEATURE_MARQUEE_FEATURES, FEATURE_MARQUEE_MODELS } from './content'

const FEATURE_ICONS: Record<string, LucideIcon> = {
  'gpt-image-2': ImageIcon,
  'nano-banana-2': Wand2,
  'seedance-2-5': Clapperboard,
  'flux-pro': Sparkles,
  'kling-video': Video,
  'veo-3': Video,
  'imagen-4': ImageIcon,
  'ideogram-3': Sparkles,
  'ugc-studio': UserRound,
  captions: Captions,
  'voice-overs': Mic,
  'static-ads': Layers3,
  slideshows: Layers3,
  'ai-influencers': UserRound,
  'video-studio': Clapperboard,
  'brand-voice': AudioLines,
}

type MarqueeItem = { id: string; label: string }

function MarqueeBadge({ item }: { item: MarqueeItem }) {
  const Icon = FEATURE_ICONS[item.id] ?? Sparkles

  return (
    <Badge
      variant="outline"
      className="h-8 gap-2 rounded-md border-border/70 bg-background/90 px-3 py-0 text-xs font-medium tracking-[-0.02em] text-foreground/85 shadow-none [&>svg]:size-3.5 [&>svg]:stroke-[1.75]"
    >
      <Icon aria-hidden="true" />
      {item.label}
    </Badge>
  )
}

function MarqueeRow({
  items,
  reverse = false,
  durationClass,
}: {
  items: readonly MarqueeItem[]
  reverse?: boolean
  durationClass: string
}) {
  return (
    <Marquee
      reverse={reverse}
      pauseOnHover
      repeat={5}
      className={`py-3 [--gap:0.75rem] ${durationClass}`}
    >
      {items.map(item => (
        <MarqueeBadge key={item.id} item={item} />
      ))}
    </Marquee>
  )
}

export function FeaturesMarquee() {
  return (
    <section className="bg-muted/15" aria-label="Studio features and AI models">
      <p className="sr-only">Features and models available in Socialista</p>
      <MarqueeRow items={FEATURE_MARQUEE_MODELS} reverse durationClass="[--duration:42s]" />
      <MarqueeRow items={FEATURE_MARQUEE_FEATURES} durationClass="[--duration:48s]" />
    </section>
  )
}
