'use client'

import { BadgeCheck, Heart, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

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
}

export function SwipeCarouselCard({
  media,
  index,
  total,
  isTop,
  stackDepth,
  reduceMotion,
  variant = 'post',
  influencer,
  embedded = false,
}: SwipeCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoSrc = media.video || undefined
  const playVideo = Boolean(videoSrc) && !reduceMotion && isTop && stackDepth === 0
  const isInfluencer = variant === 'influencer' && influencer

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (playVideo) {
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [playVideo])

  const radius = embedded ? 'rounded-none' : 'rounded-[1.75rem]'

  return (
    <article
      className={cn(
        '@container-size relative size-full overflow-hidden bg-black',
        radius,
      )}
      aria-label={
        isInfluencer
          ? `Creator ${influencer.name}, ${index + 1} of ${total}`
          : `Sample post ${index + 1} of ${total}`
      }
      aria-hidden={!isTop}
    >
      <Image
        src={media.poster}
        alt=""
        fill
        draggable={false}
        sizes={embedded ? '280px' : '(max-width: 768px) 58vw, 17.5rem'}
        priority={index < 2}
        className="pointer-events-none object-cover outline outline-1 -outline-offset-1 outline-white/10"
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
            <span className="inline-flex max-w-[72%] items-center gap-[1.8cqw] rounded-full border border-white/20 bg-black/35 px-[2.8cqw] py-[1.4cqw] backdrop-blur-md">
              <BadgeCheck className="size-[3.4cqw] shrink-0 text-[#21c985]" strokeWidth={2.25} />
              <span className="truncate text-[2.65cqw] font-semibold tracking-[-0.02em] text-white">
                AI creator
              </span>
            </span>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 px-[5%] pb-[14%] pt-[18%]"
            style={{
              background:
                'linear-gradient(to top, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.42) 48%, transparent 100%)',
            }}
          >
            <div className="flex flex-wrap items-end gap-x-[2.5cqw] gap-y-[1cqw]">
              <h3 className="text-[5.2cqw] font-semibold leading-none tracking-[-0.03em] text-white">
                {influencer.name}
              </h3>
              <p className="pb-[0.35cqw] text-[3.1cqw] font-medium leading-none text-white/72">
                {influencer.age}
              </p>
            </div>
            <p className="mt-[2cqw] text-[3.35cqw] font-medium leading-snug tracking-[-0.015em] text-white/88">
              {influencer.hook}
            </p>
            <ul className="mt-[2.4cqw] flex flex-wrap gap-[1.6cqw]">
              {influencer.tags.map(tag => (
                <li
                  key={tag}
                  className="rounded-full border border-white/22 bg-white/10 px-[2.4cqw] py-[1.1cqw] text-[2.55cqw] font-medium leading-none tracking-[-0.01em] text-white/92 backdrop-blur-sm"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          {isTop && stackDepth === 0 ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[3.5%] flex items-center justify-center gap-[7cqw]"
              aria-hidden
            >
              <span className="flex size-[9.5cqw] items-center justify-center rounded-full border border-white/18 bg-black/45 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.65)] backdrop-blur-md">
                <X className="size-[4.2cqw] text-[#ff4458]" strokeWidth={2.5} />
              </span>
              <span className="flex size-[11cqw] items-center justify-center rounded-full border border-white/18 bg-black/45 shadow-[0_10px_28px_-10px_rgb(0_0_0/0.7)] backdrop-blur-md">
                <Heart className="size-[5cqw] fill-[#21c985] text-[#21c985]" strokeWidth={2} />
              </span>
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  )
}
