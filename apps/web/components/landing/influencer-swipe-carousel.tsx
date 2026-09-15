'use client'

import { cn } from '@/lib/utils'

import { INFLUENCER_SWIPE_ITEMS, SwipeCarousel } from './swipe-carousel'

type InfluencerSwipeCarouselProps = {
  className?: string
}

const CARD_WIDTH = 'w-[17.5rem] max-w-[72vw]'

const INFLUENCER_FRAME =
  'h-full w-full rounded-[1.75rem] border border-white/10 shadow-[0_20px_44px_-22px_color-mix(in_oklch,var(--foreground)_22%,transparent)]'

export function InfluencerSwipeCarousel({ className }: InfluencerSwipeCarouselProps) {
  return (
    <div className={cn('mx-auto shrink-0', CARD_WIDTH, className)}>
      {/* Fixed 9:16 box reserves document flow height so the stack cannot overlap sections below. */}
      <div className={cn('relative aspect-[9/16]', CARD_WIDTH)}>
        <SwipeCarousel
          items={INFLUENCER_SWIPE_ITEMS}
          variant="influencer"
          embedded
          fillHeight
          ariaLabel="Swipe through AI creators for your brand"
          className="absolute inset-0 size-full"
          cardClassName="size-full"
          stageClassName="size-full max-w-none p-0"
          cardFrameClassName={INFLUENCER_FRAME}
          showStackBase={false}
          showSwipeHint={false}
          autoplayMs={5200}
        />
      </div>
    </div>
  )
}
