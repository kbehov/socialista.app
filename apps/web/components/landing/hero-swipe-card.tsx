'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type HeroSwipeCardProps = {
  media: {
    poster: string
    video?: string
    objectPosition: string
  }
  index: number
  total: number
  isTop: boolean
  stackDepth: number
  reduceMotion: boolean
}

export function HeroSwipeCard({
  media,
  index,
  total,
  isTop,
  stackDepth,
  reduceMotion,
}: HeroSwipeCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const playVideo = Boolean(media.video) && !reduceMotion && isTop && stackDepth === 0

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
      className="relative size-full overflow-hidden rounded-[1.75rem] bg-black"
      aria-label={`Sample post ${index + 1} of ${total}`}
      aria-hidden={!isTop}
    >
      <Image
        src={media.poster}
        alt=""
        fill
        sizes="(max-width: 768px) 58vw, 17.5rem"
        priority={index < 2}
        className="object-cover"
        style={{ objectPosition: media.objectPosition }}
      />

      {media.video && !reduceMotion ? (
        <video
          ref={videoRef}
          src={media.video}
          muted
          loop
          playsInline
          preload={index < 2 ? 'auto' : 'metadata'}
          aria-hidden="true"
          onPlaying={() => setVideoReady(true)}
          className={`absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 ease-out${
            videoReady && playVideo ? ' opacity-100' : ''
          }`}
          style={{ objectPosition: media.objectPosition }}
        />
      ) : null}
    </article>
  )
}
