"use client";

import { useReducedMotion } from "motion/react";

import { SwipeStack } from "@/components/ui/swipe-stack";
import { HeroFloatingBadges } from "./hero-floating-badges";
import { HeroSwipeCard } from "./hero-swipe-card";
import { HERO_SLIDES } from "./content";
import type { PlatformId } from "./content";
import { IMG, VIDEO } from "./media";

const SLIDE_MEDIA = {
  ugc: {
    poster: IMG.posterUgc1,
    video: VIDEO.talking1,
    objectPosition: "50% 18%",
  },
  video: {
    poster: IMG.studioImages,
    video: VIDEO.productHold,
    objectPosition: "50% 20%",
  },
  carousel: {
    poster: IMG.posterUgc5,
    video: VIDEO.lifestyle,
    objectPosition: "50% 22%",
  },
  ads: {
    poster: IMG.adStill,
    video: VIDEO.motion,
    objectPosition: "50% 50%",
  },
  talent: {
    poster: IMG.posterUgc8,
    video: VIDEO.talking2,
    objectPosition: "50% 16%",
  },
  slideshow: {
    poster: IMG.slideshow,
    video: VIDEO.lifestyle,
    objectPosition: "50% 24%",
  },
  influencer: {
    poster: IMG.influencer,
    video: VIDEO.talking1,
    objectPosition: "50% 18%",
  },
} as const;

const AUTOPLAY_MS = 4500;

const HERO_FLOATING_BADGES: Array<{
  platform: PlatformId;
  slot: "top-left" | "mid-left" | "mid-right";
}> = [
  { platform: "tiktok", slot: "top-left" },
  { platform: "youtube", slot: "mid-left" },
  { platform: "instagram", slot: "mid-right" },
];

export function HeroCarousel() {
  const reduceMotion = useReducedMotion();

  return (
    <SwipeStack
      items={HERO_SLIDES}
      getItemKey={(slide) => slide.id}
      ariaLabel="Sample social posts"
      className="w-full"
      stageClassName="w-full max-w-none px-4 sm:px-5"
      cardClassName="w-[min(17.5rem,32vh,58vw)]"
      maxVisible={3}
      autoplayMs={AUTOPLAY_MS}
      liveRegion={(activeIndex) => (
        <div className="sr-only" aria-live="polite">
          {HERO_SLIDES[activeIndex]?.hook}
        </div>
      )}
      overlay={(activeIndex) => {
        const slide = HERO_SLIDES[activeIndex];
        if (!slide) return null;

        return (
          <HeroFloatingBadges
            active
            badges={HERO_FLOATING_BADGES.map((badge) => ({
              platform: badge.platform,
              slot: badge.slot,
              views: slide.views,
              likes: slide.likes,
            }))}
          />
        );
      }}
      renderCard={(slide, context) => (
        <HeroSwipeCard
          media={SLIDE_MEDIA[slide.id]}
          index={context.index}
          total={context.total}
          isTop={context.isTop}
          stackDepth={context.stackDepth}
          reduceMotion={Boolean(reduceMotion)}
        />
      )}
    />
  );
}
