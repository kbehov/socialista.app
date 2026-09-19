'use client'

import { useReducedMotion } from 'motion/react'

import { SwipeStack } from '@/components/ui/swipe-stack'

import { HERO_SLIDES, INFLUENCER_SWIPE_CREATORS, type PlatformId } from './content'
import { HeroFloatingBadges } from './hero-floating-badges'
import { INFLUENCER_SWIPE_IMAGES, LANDING_CLIPS } from './media'
import {
  SwipeCarouselCard,
  type SwipeCarouselInfluencer,
  type SwipeCarouselMedia,
} from './swipe-carousel-card'

export type SwipeCarouselItem = {
  id: string
  hook?: string
  likes?: string
  views?: string
  media: SwipeCarouselMedia
  influencer?: SwipeCarouselInfluencer
}

export type SwipeCarouselBadge = {
  platform: PlatformId
  slot: 'top-left' | 'mid-left' | 'mid-right'
}

export const LANDING_SWIPE_ITEMS: SwipeCarouselItem[] = HERO_SLIDES.map(slide => ({
  id: slide.id,
  hook: slide.hook,
  likes: slide.likes,
  views: slide.views,
  media: LANDING_CLIPS[slide.id],
}))

export const INFLUENCER_SWIPE_ITEMS: SwipeCarouselItem[] = INFLUENCER_SWIPE_CREATORS.map(
  (creator, index) => ({
    id: creator.id,
    hook: creator.hook,
    media: {
      poster: INFLUENCER_SWIPE_IMAGES[index] ?? INFLUENCER_SWIPE_IMAGES[0],
      objectPosition: creator.objectPosition,
    },
    influencer: {
      name: creator.name,
      age: creator.age,
      hook: creator.hook,
      tags: creator.tags,
    },
  }),
)

export const LANDING_SWIPE_BADGES: SwipeCarouselBadge[] = [
  { platform: 'tiktok', slot: 'top-left' },
  { platform: 'youtube', slot: 'mid-left' },
  { platform: 'instagram', slot: 'mid-right' },
]

const AUTOPLAY_MS = 4500
const INFLUENCER_AUTOPLAY_MS = 5200

const INFLUENCER_SWIPE_LABELS = {
  left: 'Match',
  right: 'Pass',
}

type SwipeCarouselProps = {
  items?: readonly SwipeCarouselItem[]
  badges?: readonly SwipeCarouselBadge[]
  ariaLabel?: string
  autoplayMs?: number
  className?: string
  cardClassName?: string
  cardFrameClassName?: string
  stageClassName?: string
  variant?: 'post' | 'influencer'
  embedded?: boolean
  showStackBase?: boolean
  swipeLabels?: { left: string; right: string }
  showSwipeHint?: boolean
  maxVisible?: number
  fillHeight?: boolean
  stackPeek?: boolean
  swipeHintVariant?: 'default' | 'influencer'
}

export function SwipeCarousel({
  items = LANDING_SWIPE_ITEMS,
  badges,
  ariaLabel = 'Sample social posts',
  autoplayMs,
  className = 'w-full',
  cardClassName = 'w-[min(17.5rem,32vh,58vw)]',
  cardFrameClassName,
  stageClassName,
  variant = 'post',
  embedded = false,
  showStackBase = true,
  swipeLabels,
  showSwipeHint = true,
  maxVisible,
  fillHeight,
  stackPeek,
  swipeHintVariant,
}: SwipeCarouselProps) {
  const reduceMotion = useReducedMotion()
  const isInfluencer = variant === 'influencer'
  const resolvedAutoplay =
    autoplayMs ?? (isInfluencer ? INFLUENCER_AUTOPLAY_MS : AUTOPLAY_MS)
  const resolvedLabels = swipeLabels ?? (isInfluencer ? INFLUENCER_SWIPE_LABELS : undefined)
  const resolvedStage = stageClassName ?? (embedded ? 'size-full max-w-none p-0' : 'w-full max-w-none px-4 sm:px-5')
  const resolvedCard = cardClassName ?? (embedded ? 'size-full' : 'w-[min(17.5rem,32vh,58vw)]')
  const resolvedFrame =
    cardFrameClassName ??
    (embedded
      ? 'aspect-auto h-full w-full rounded-none shadow-none'
      : isInfluencer
        ? 'shadow-[0_20px_44px_-22px_color-mix(in_oklch,var(--foreground)_22%,transparent)]'
        : undefined)

  const resolvedStackPeek = stackPeek ?? isInfluencer
  const resolvedMaxVisible = maxVisible ?? (resolvedStackPeek ? 3 : isInfluencer ? 2 : 3)
  const resolvedFillHeight = fillHeight ?? embedded

  return (
    <SwipeStack
      items={items}
      getItemKey={slide => slide.id}
      ariaLabel={ariaLabel}
      className={className}
      stageClassName={resolvedStage}
      cardClassName={resolvedCard}
      cardFrameClassName={resolvedFrame}
      maxVisible={resolvedMaxVisible}
      autoplayMs={resolvedAutoplay}
      swipeLabels={resolvedLabels}
      showSwipeHint={showSwipeHint && (!embedded || isInfluencer)}
      swipeHintVariant={swipeHintVariant ?? (isInfluencer ? 'influencer' : 'default')}
      showStackBase={showStackBase}
      fillHeight={resolvedFillHeight}
      stackPeek={resolvedStackPeek}
      liveRegion={activeIndex => (
        <div className="sr-only" aria-live="polite">
          {isInfluencer
            ? items[activeIndex]?.influencer?.name
            : items[activeIndex]?.hook}
        </div>
      )}
      overlay={
        badges?.length && !isInfluencer
          ? activeIndex => {
              const slide = items[activeIndex]
              const likes = slide?.likes
              const views = slide?.views
              if (!likes || !views) return null

              return (
                <HeroFloatingBadges
                  active
                  badges={badges.map(badge => ({
                    platform: badge.platform,
                    slot: badge.slot,
                    views,
                    likes,
                  }))}
                />
              )
            }
          : undefined
      }
      renderCard={(slide, context) => (
        <SwipeCarouselCard
          media={slide.media}
          index={context.index}
          total={context.total}
          isTop={context.isTop}
          stackDepth={context.stackDepth}
          reduceMotion={Boolean(reduceMotion)}
          variant={isInfluencer ? 'influencer' : 'post'}
          influencer={slide.influencer}
          embedded={embedded}
          swipeActions={context.swipeActions}
        />
      )}
    />
  )
}
