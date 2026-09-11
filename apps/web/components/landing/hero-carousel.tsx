'use client'

import { HeroEngagementBadges } from '@/components/cards/hero-engagement-badges'
import { HeroPhoneSlide } from '@/components/cards/hero-phone-slide'
import { StackCarousel } from '@/components/ui/stack-carousel'
import { useReducedMotion } from 'motion/react'

import { HERO_SLIDES } from './content'
import { IMG, VIDEO } from './media'

const SLIDE_MEDIA = {
  ugc: { poster: IMG.p1, video: VIDEO.tea, objectPosition: '50% 18%' },
  video: { poster: IMG.fashion1, video: VIDEO.hoop, objectPosition: '50% 20%' },
  carousel: { poster: IMG.p5, video: VIDEO.horses, objectPosition: '50% 22%' },
  ads: { poster: IMG.watch, video: VIDEO.motion, objectPosition: '50% 50%' },
  talent: { poster: IMG.p8, video: VIDEO.beach, objectPosition: '50% 16%' },
} as const

const AUTOPLAY_MS = 4500

export function HeroCarousel() {
  const reduceMotion = useReducedMotion()

  return (
    <StackCarousel
      items={HERO_SLIDES}
      getItemKey={slide => slide.id}
      ariaLabel="Sample social posts"
      indicatorLabel="Sample social posts"
      autoplayMs={AUTOPLAY_MS}
      liveRegion={activeIndex => (
        <div className="sr-only" aria-live="polite">
          {HERO_SLIDES[activeIndex]?.hook}
        </div>
      )}
      overlay={activeIndex => (
        <HeroEngagementBadges
          activeIndex={activeIndex}
          slides={HERO_SLIDES}
          reduceMotion={Boolean(reduceMotion)}
        />
      )}
      renderSlide={(slide, { index, offset, isActive, goTo }) => (
        <HeroPhoneSlide
          slide={slide}
          media={SLIDE_MEDIA[slide.id]}
          offset={offset}
          isActive={isActive}
          index={index}
          total={HERO_SLIDES.length}
          reduceMotion={Boolean(reduceMotion)}
          onSelect={() => goTo(index)}
        />
      )}
    />
  )
}
