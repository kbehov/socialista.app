'use client'

import { BadgeCheck, Heart, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { SwipeStackSwipeActions } from '@/components/ui/swipe-stack'
import { cn } from '@/lib/utils'

import { INFLUENCER_SECTION } from './content'

export type SwipeCarouselMedia = {
  poster: string
  video?: string
  objectPosition: string
}

export type SwipeCarouselInfluencer = {
  name: string
  age: number
  hook: string
  tags: readonly string[]
}

type SwipeCarouselCardProps = {
  media: SwipeCarouselMedia
  index: number
  total: number
  isTop: boolean
  stackDepth: number
  reduceMotion: boolean
  variant?: 'post' | 'influencer'
  influencer?: SwipeCarouselInfluencer
  embedded?: boolean
  swipeActions?: SwipeStackSwipeActions
}

export function SwipeCarouselCard({
  media,
  index,
  total,
  isTop,
  stackDepth,
  reduceMotion,
  variant = 'post',
  influencer: _influencer,
  embedded = false,
  swipeActions,
}: SwipeCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoSrc = media.video || undefined
  const playVideo = Boolean(videoSrc) && !reduceMotion && isTop && stackDepth === 0
  const isInfluencer = variant === 'influencer'
  const showActionButtons = isInfluencer && isTop && stackDepth === 0 && swipeActions

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (playVideo) {
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [playVideo])

  const radius =
    embedded && variant !== 'influencer' ? 'rounded-none' : 'rounded-[var(--landing-media-radius)]'
  const imageSizes =
    variant === 'influencer'
      ? '(max-width: 768px) 90vw, 560px'
      : embedded
        ? '560px'
        : '(max-width: 768px) 58vw, 560px'

  return (
    <article
      className={cn(
        '@container-size relative size-full overflow-hidden bg-black',
        radius,
        isInfluencer && 'ring-1 ring-inset ring-white/20',
      )}
      aria-label={
        isInfluencer
          ? `AI creator preview ${index + 1} of ${total}`
          : `Sample post ${index + 1} of ${total}`
      }
      aria-hidden={!isTop}
    >
      <Image
        src={media.poster}
        alt=""
        fill
        draggable={false}
        quality={92}
        sizes={imageSizes}
        priority={index < 3}
        className="pointer-events-none object-cover"
        style={{ objectPosition: media.objectPosition }}
      />

      {videoSrc && !reduceMotion ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload={index < 2 ? 'auto' : 'metadata'}
          aria-hidden="true"
          onPlaying={() => setVideoReady(true)}
          className={`pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out${
            videoReady && playVideo ? ' opacity-100' : ''
          }`}
          style={{ objectPosition: media.objectPosition }}
        />
      ) : null}

      {isInfluencer ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-black/55 via-black/20 to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-[4.5%] top-[5.5%] flex items-center gap-[2.2cqw]">
            <span className="inline-flex max-w-[85%] items-center gap-[1.8cqw] rounded-full border border-white/20 bg-black/35 px-[2.8cqw] py-[1.4cqw] backdrop-blur-md">
              <BadgeCheck className="size-[3.4cqw] shrink-0 text-[#21c985]" strokeWidth={2.25} />
              <span className="truncate text-[2.65cqw] font-semibold tracking-[-0.02em] text-white">
                {INFLUENCER_SECTION.mockup.badge}
              </span>
            </span>
          </div>

          {showActionButtons ? (
            <div
              className="absolute inset-x-0 bottom-[4%] z-50 flex items-center justify-center gap-8"
            >
              <button
                type="button"
                aria-label="Pass"
                className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/50 shadow-[0_10px_28px_-10px_rgb(0_0_0/0.7)] backdrop-blur-md transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 sm:size-[3.75rem]"
                onPointerDown={event => event.stopPropagation()}
                onClick={event => {
                  event.stopPropagation()
                  swipeActions.pass()
                }}
              >
                <X className="size-7 text-[#ff4458] sm:size-8" strokeWidth={2.75} />
              </button>
              <button
                type="button"
                aria-label="Match"
                className="flex size-16 items-center justify-center rounded-full border border-white/20 bg-black/50 shadow-[0_12px_32px_-10px_rgb(0_0_0/0.75)] backdrop-blur-md transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 sm:size-[4.25rem]"
                onPointerDown={event => event.stopPropagation()}
                onClick={event => {
                  event.stopPropagation()
                  swipeActions.match()
                }}
              >
                <Heart
                  className="size-8 fill-[#21c985] text-[#21c985] sm:size-9"
                  strokeWidth={2}
                />
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  )
}
