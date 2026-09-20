'use client'

import { cn } from '@/lib/utils'

import { INFLUENCER_SWIPE_ITEMS, SwipeCarousel } from './swipe-carousel'

type InfluencerSwipeCarouselProps = {
  className?: string
}

const CARD_WIDTH = 'w-[17.5rem] max-w-[72vw]'

const INFLUENCER_FRAME = 'h-full w-full border-0 bg-transparent shadow-none'

export function InfluencerSwipeCarousel({ className }: InfluencerSwipeCarouselProps) {
  return (
    <div className={cn('mx-auto shrink-0', CARD_WIDTH, className)}>
      {/* Fixed 9:16 box reserves document flow height so the stack cannot overlap sections below. */}
      <div className={cn('relative aspect-[9/16] pb-7', CARD_WIDTH)}>
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
          showSwipeHint
          autoplayMs={5200}
        />
      </div>
    </div>
  )
}
