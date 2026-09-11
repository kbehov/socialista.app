'use client'

import { HeroSlideOverlay } from '@/components/cards/hero-slide-overlay'
import { GlareHover } from '@/components/ui/glare-hover'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type HeroPhoneSlideProps = {
  slide: {
    id: string
    layout: 'caption' | 'card'
    hook: string
    line: string
  }
  media: {
    poster: string
    video?: string
    objectPosition: string
  }
  offset: number
  isActive: boolean
  index: number
  total: number
  reduceMotion: boolean
  onSelect: () => void
}

type StackTransform = {
  x: string
  scale: number
  opacity: number
  zIndex: number
}

const HIDDEN: StackTransform = { x: '0%', scale: 0.5, opacity: 0, zIndex: 20 }

const DESKTOP_OFFSETS: Record<number, StackTransform> = {
  [-2]: { x: '-108%', scale: 0.6, opacity: 0.85, zIndex: 30 },
  [-1]: { x: '-62%', scale: 0.78, opacity: 1, zIndex: 40 },
  [0]: { x: '0%', scale: 1, opacity: 1, zIndex: 50 },
  [1]: { x: '62%', scale: 0.78, opacity: 1, zIndex: 40 },
  [2]: { x: '108%', scale: 0.6, opacity: 0.85, zIndex: 30 },
}

const MOBILE_OFFSETS: Record<number, StackTransform> = {
  [-2]: { x: '-72%', scale: 0.55, opacity: 0.72, zIndex: 30 },
  [-1]: { x: '-40%', scale: 0.78, opacity: 1, zIndex: 40 },
  [0]: { x: '0%', scale: 1, opacity: 1, zIndex: 50 },
  [1]: { x: '40%', scale: 0.78, opacity: 1, zIndex: 40 },
  [2]: { x: '72%', scale: 0.55, opacity: 0.72, zIndex: 30 },
}

function getStackTransform(offset: number, isMobile: boolean): StackTransform {
  if (Math.abs(offset) > 2) return HIDDEN
  const map = isMobile ? MOBILE_OFFSETS : DESKTOP_OFFSETS
  return map[offset] ?? HIDDEN
}

export function HeroPhoneSlide({
  slide,
  media,
  offset,
  isActive,
  index,
  total,
  reduceMotion,
  onSelect,
}: HeroPhoneSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const playVideo = Boolean(media.video) && !reduceMotion && Math.abs(offset) <= 1
  const showOverlay = Math.abs(offset) <= 1
  const stack = getStackTransform(offset, isMobile)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

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
    <article
      className={cn(
        '@container absolute left-1/2 top-1/2 aspect-[9/16] w-[clamp(12.5rem,30vw,18.75rem)] overflow-hidden rounded-[1.15rem] bg-[#1a1a1a] shadow-[0_25px_50px_-12px_rgb(0_0_0/0.28)] will-change-transform md:rounded-[1.65rem] dark:shadow-[0_28px_56px_-16px_rgb(0_0_0/0.55)]',
        reduceMotion ? 'transition-none' : 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
      )}
      style={{
        zIndex: stack.zIndex,
        opacity: stack.opacity,
        transform: `translate(-50%, -50%) translateX(${stack.x}) scale(${stack.scale})`,
      }}
      aria-label={`Sample post ${index + 1} of ${total}`}
      aria-hidden={!isActive && Math.abs(offset) > 1}
    >
      {!isActive ? (
        <button
          type="button"
          className="absolute inset-0 z-[4] cursor-pointer border-0 bg-transparent p-0"
          onClick={onSelect}
          tabIndex={-1}
        >
          <span className="sr-only">Show post {index + 1}</span>
        </button>
      ) : null}

      <GlareHover
        width="100%"
        height="100%"
        background="#1a1a1a"
        color="#ffffff"
        opacity={0.28}
        playOnce
        className={cn(
          'size-full rounded-[1.15rem] md:rounded-[1.65rem]',
          reduceMotion && 'before:transition-none hover:before:transition-none'
        )}
      >
        <div className="relative size-full overflow-hidden bg-[#222]">
        <Image
          src={media.poster}
          alt=""
          fill
          sizes="(max-width: 768px) 52vw, 300px"
          priority={index < 2}
          className="object-cover"
          style={{ objectPosition: media.objectPosition }}
        />

        {media.video && !reduceMotion && Math.abs(offset) <= 2 ? (
          <video
            ref={videoRef}
            src={media.video}
            muted
            loop
            playsInline
            preload={index < 2 ? 'auto' : 'metadata'}
            aria-hidden="true"
            onPlaying={() => setVideoReady(true)}
            className={cn(
              'absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out',
              videoReady && playVideo && 'opacity-100'
            )}
            style={{ objectPosition: media.objectPosition }}
          />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to bottom, rgb(0 0 0 / 0.28), transparent 28%, transparent 62%, rgb(0 0 0 / 0.38))',
          }}
        />

        <HeroSlideOverlay
          layout={slide.layout}
          hook={slide.hook}
          line={slide.line}
          visible={showOverlay}
        />

        <span
          className="pointer-events-none absolute bottom-[0.45rem] left-1/2 z-[5] h-[0.28rem] w-[28%] -translate-x-1/2 rounded-full bg-white/[0.88]"
          aria-hidden="true"
        />
        </div>
      </GlareHover>
    </article>
  )
}
