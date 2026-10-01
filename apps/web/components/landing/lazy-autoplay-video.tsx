'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

type LazyAutoplayVideoProps = {
  src: string
  poster?: string
  className?: string
  objectPosition?: string
}

export function LazyAutoplayVideo({
  src,
  poster,
  className,
  objectPosition = '50% 50%',
}: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    // Reduced motion: keep the poster frame, never autoplay
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.some(entry => entry.isIntersecting)
        if (visible) {
          void el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { rootMargin: '120px', threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={cn('absolute inset-0 size-full object-cover', className)}
      style={{ objectPosition }}
    />
  )
}
