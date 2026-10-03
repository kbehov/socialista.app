'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'

import { Iphone } from '@/components/ui/iphone'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

import { HERO_MARQUEE_POSTERS, LANDING_CLIPS } from './media'

const FEATURED_CLIP = LANDING_CLIPS.ugc

/** Repeat posters so each marquee track is wider than the viewport (seamless loop). */
const HERO_MARQUEE_COPIES = 3

const HERO_MARQUEE_CLIPS = Array.from({ length: HERO_MARQUEE_COPIES }, (_, copy) =>
  HERO_MARQUEE_POSTERS.map((poster, index) => ({
    id: `hero-marquee-${copy}-${index}`,
    poster,
    objectPosition: '50% 20%',
  })),
).flat()

type MarqueeClip = (typeof HERO_MARQUEE_CLIPS)[number]

function HeroMarqueeClip({ clip, priority = false }: { clip: MarqueeClip; priority?: boolean }) {
  return (
    <div className="relative h-[12.75rem] w-[7.6rem] shrink-0 overflow-hidden rounded-[var(--landing-media-radius)] bg-[var(--landing-media-dark)] shadow-[0_0_0_1px_oklch(0_0_0/0.1),0_22px_44px_-24px_rgb(0_0_0/0.45),inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:h-[16.75rem] sm:w-[10rem] lg:h-[19.5rem] lg:w-[11.5rem]">
      <Image
        src={clip.poster}
        alt=""
        fill
        priority={priority}
        quality={75}
        sizes="(max-width: 640px) 122px, (max-width: 1024px) 160px, 184px"
        className="object-cover"
        style={{ objectPosition: clip.objectPosition }}
      />
    </div>
  )
}

function HeroMarqueeClips({
  reduceMotion,
  className,
}: {
  reduceMotion: boolean
  className?: string
}) {
  const clips = HERO_MARQUEE_CLIPS.map((clip, index) => (
    <HeroMarqueeClip key={clip.id} clip={clip} priority={index === 0} />
  ))

  if (reduceMotion) {
    return (
      <div className={cn('flex justify-center gap-3 overflow-hidden sm:gap-4', className)}>
        {clips}
      </div>
    )
  }

  return (
    <Marquee
      pauseOnHover
      repeat={2}
      className={cn('w-full p-0 [--duration:48s] [--gap:0.8rem] sm:[--gap:1.05rem]', className)}
    >
      {clips}
    </Marquee>
  )
}

export function HeroMarquee() {
  const reduceMotion = useReducedMotion()
  const featuredVideo = reduceMotion ? undefined : FEATURED_CLIP.video || undefined

  return (
    <div className="relative" aria-hidden="true">
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-[4%] overflow-hidden py-5',
          '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
          'sm:pointer-events-auto sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        )}
      >
        <HeroMarqueeClips reduceMotion={Boolean(reduceMotion)} />
      </div>

      <div className="relative z-10 flex justify-center px-4">
        <Iphone
          variant="black"
          bezel="thin"
          priority
          src={FEATURED_CLIP.poster}
          videoSrc={featuredVideo}
          className="w-[11.25rem] drop-shadow-[0_32px_64px_-20px_color-mix(in_oklch,var(--landing-ink)_28%,transparent)] sm:w-[14.25rem] lg:w-[16.5rem]"
        />
      </div>
    </div>
  )
}
