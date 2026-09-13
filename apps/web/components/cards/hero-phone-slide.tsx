'use client'

import { HeroEngagementBadges } from '@/components/cards/hero-engagement-badges'
import { HeroSlideOverlay } from '@/components/cards/hero-slide-overlay'
import { IPHONE_ASPECT_RATIO, Iphone } from '@/components/ui/iphone'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type HeroPhoneSlideProps = {
  slide: {
    id: string
    layout: 'caption' | 'card'
    hook: string
    line: string
    likes: string
    views: string
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

const HIDDEN: StackTransform = { x: '0vw', scale: 0.5, opacity: 0, zIndex: 20 }

const DESKTOP_SCALES = [1, 0.86, 0.74, 0.64] as const
const DESKTOP_OPACITIES = [1, 1, 0.9, 0.75] as const
const MOBILE_SCALES = [1, 0.84, 0.7] as const
const MOBILE_OPACITIES = [1, 1, 0.82] as const

function getMaxVisibleOffset(isMobile: boolean) {
  return isMobile ? 2 : 3
}

function getStackTransform(offset: number, isMobile: boolean): StackTransform {
  const maxOffset = getMaxVisibleOffset(isMobile)
  if (Math.abs(offset) > maxOffset) return HIDDEN

  const abs = Math.abs(offset)
  const stepVw = isMobile ? 27 : 16
  const scales = isMobile ? MOBILE_SCALES : DESKTOP_SCALES
  const opacities = isMobile ? MOBILE_OPACITIES : DESKTOP_OPACITIES

  return {
    x: `${offset * stepVw}vw`,
    scale: scales[abs] ?? 0.5,
    opacity: opacities[abs] ?? 0,
    zIndex: 50 - abs * 8,
  }
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
  const maxVisibleOffset = getMaxVisibleOffset(isMobile)
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
        '@container absolute left-1/2 top-1/2 h-full w-auto will-change-transform',
        reduceMotion ? 'transition-none' : 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
      )}
      style={{
        aspectRatio: IPHONE_ASPECT_RATIO,
        zIndex: stack.zIndex,
        opacity: stack.opacity,
        transform: `translate(-50%, -50%) translateX(${stack.x}) scale(${stack.scale})`,
      }}
      aria-label={`Sample post ${index + 1} of ${total}`}
      aria-hidden={!isActive && Math.abs(offset) > maxVisibleOffset - 1}
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

      <Iphone
        instanceId={`hero-slide-${slide.id}-${index}`}
        variant="black"
        bezel="minimal"
        className="size-full drop-shadow-[0_25px_50px_-12px_rgb(0_0_0/0.28)] dark:drop-shadow-[0_28px_56px_-16px_rgb(0_0_0/0.55)]"
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

          {media.video && !reduceMotion && Math.abs(offset) <= maxVisibleOffset ? (
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

          <HeroSlideOverlay
            layout={slide.layout}
            hook={slide.hook}
            line={slide.line}
            visible={showOverlay}
          />

          <HeroEngagementBadges
            likes={slide.likes}
            views={slide.views}
            active={isActive}
            reduceMotion={reduceMotion}
          />
        </div>
      </Iphone>
    </article>
  )
}
