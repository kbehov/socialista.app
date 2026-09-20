'use client'

import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { Iphone } from '@/components/ui/iphone'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

import { HERO_MARQUEE_POSTERS, LANDING_CLIPS } from './media'

const FEATURED_CLIP = LANDING_CLIPS.ugc

/** Repeat posters so each marquee track is wider than the viewport (seamless loop). */
const HERO_MARQUEE_COPIES = 3
const HERO_MARQUEE_IMAGE_QUALITY = 92

const HERO_MARQUEE_CLIPS = Array.from({ length: HERO_MARQUEE_COPIES }, (_, copy) =>
  HERO_MARQUEE_POSTERS.map((poster, index) => ({
    id: `hero-marquee-${copy}-${index}`,
    poster,
    video: '',
    objectPosition: '50% 20%',
  })),
).flat()

type MarqueeClip = (typeof HERO_MARQUEE_CLIPS)[number]

function HeroMarqueeClip({ clip, reduceMotion }: { clip: MarqueeClip; reduceMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoSrc = clip.video || undefined
  const playVideo = Boolean(videoSrc) && !reduceMotion

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (playVideo) {
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [playVideo])

  return (
    <div className="relative h-[12.75rem] w-[7.6rem] shrink-0 overflow-hidden rounded-[1.35rem] bg-black shadow-[0_18px_36px_-20px_rgb(0_0_0/0.45)] ring-1 ring-black/10 sm:h-[16.75rem] sm:w-[10rem] sm:rounded-[1.5rem] lg:h-[19.5rem] lg:w-[11.5rem]">
      <Image
        src={clip.poster}
        alt=""
        fill
        quality={HERO_MARQUEE_IMAGE_QUALITY}
        sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 320px"
        className="object-cover"
        style={{ objectPosition: clip.objectPosition }}
      />
      {videoSrc && !reduceMotion ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setVideoReady(true)}
          className={cn(
            'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out',
            videoReady && playVideo && 'opacity-100',
          )}
          style={{ objectPosition: clip.objectPosition }}
        />
      ) : null}
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
  const clips = HERO_MARQUEE_CLIPS.map(clip => (
    <HeroMarqueeClip key={clip.id} clip={clip} reduceMotion={reduceMotion} />
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
          src={FEATURED_CLIP.poster}
          videoSrc={featuredVideo}
          className="w-[11.25rem] drop-shadow-[0_28px_56px_-18px_color-mix(in_oklch,var(--foreground)_32%,transparent)] sm:w-[14.25rem] lg:w-[16.5rem]"
        />
      </div>
    </div>
  )
}
