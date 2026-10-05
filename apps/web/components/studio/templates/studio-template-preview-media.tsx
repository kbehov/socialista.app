'use client'

import { isVideoPreviewUrl } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

type StudioTemplatePreviewMediaProps = {
  url: string
  alt?: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  /** Muted loop while the nearest card is hovered or focused. Fine pointers only. */
  playOnHover?: boolean
}

function canHoverPlay() {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function HoverVideo({
  url,
  className,
  controls,
}: {
  url: string
  className?: string
  controls: boolean
}) {
  const rootRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = rootRef.current
    if (!video) return
    const host = video.closest('a, button, article') ?? video

    const play = () => {
      if (!canHoverPlay()) return
      video.preload = 'auto'
      video.loop = true
      void video.play().catch(() => {})
    }

    const stop = () => {
      video.pause()
      if (video.readyState >= 1) video.currentTime = 0
    }

    host.addEventListener('pointerenter', play)
    host.addEventListener('pointerleave', stop)
    host.addEventListener('focus', play)
    host.addEventListener('blur', stop)
    return () => {
      host.removeEventListener('pointerenter', play)
      host.removeEventListener('pointerleave', stop)
      host.removeEventListener('focus', play)
      host.removeEventListener('blur', stop)
      stop()
    }
  }, [])

  return (
    <video
      ref={rootRef}
      src={url}
      muted
      playsInline
      preload="metadata"
      controls={controls}
      className={cn('bg-black object-cover', className)}
    />
  )
}

export function StudioTemplatePreviewMedia({
  url,
  alt = '',
  className,
  controls = false,
  autoPlay = false,
  playOnHover = false,
}: StudioTemplatePreviewMediaProps) {
  if (isVideoPreviewUrl(url)) {
    if (playOnHover && !autoPlay) {
      return <HoverVideo url={url} className={className} controls={controls} />
    }

    return (
      <video
        src={url}
        muted
        playsInline
        autoPlay={autoPlay}
        loop={autoPlay}
        preload={autoPlay ? 'auto' : 'metadata'}
        controls={controls}
        className={cn('bg-black object-cover', className)}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} loading="lazy" className={cn('object-cover', className)} />
  )
}
