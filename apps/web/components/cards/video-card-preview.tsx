'use client'

import { cn } from '@/lib/utils'
import { PlayIcon, VideoIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

type VideoCardPreviewProps = {
  previewUrl?: string
  previewType?: 'video' | 'image'
  className?: string
}

function PreviewPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-2 bg-neutral-950 text-white/50',
        className,
      )}
    >
      <VideoIcon className="size-5 opacity-60" strokeWidth={1.5} />
      <span className="text-[11px] font-medium">No preview</span>
    </div>
  )
}

function ImagePreview({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-full object-cover" draggable={false} />
  )
}

function canHoverPlay() {
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function VideoPreview({ src }: { src: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const host = root.closest('a, button') ?? root

    const play = () => {
      if (!canHoverPlay()) return
      const video = videoRef.current
      if (!video) return
      video.preload = 'auto'
      video.loop = true
      void video.play().catch(() => {})
    }

    const stop = () => {
      const video = videoRef.current
      if (!video) return
      video.pause()
      if (video.readyState >= 1) video.currentTime = 0.1
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
    <div ref={rootRef} className="relative size-full">
      <video
        ref={videoRef}
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className="size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-opacity duration-200 ease-out group-hover/card:opacity-0 group-focus-within/card:opacity-0 motion-reduce:group-hover/card:opacity-100 motion-reduce:group-focus-within/card:opacity-100 motion-reduce:transition-none">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
          <PlayIcon className="ml-0.5 size-4 fill-current" />
        </div>
      </div>
    </div>
  )
}

export function VideoCardPreview({ previewUrl, previewType, className }: VideoCardPreviewProps) {
  if (!previewUrl || !previewType) {
    return <PreviewPlaceholder className={className} />
  }

  return (
    <div className={cn('relative size-full bg-black', className)}>
      {previewType === 'image' ? <ImagePreview src={previewUrl} /> : <VideoPreview src={previewUrl} />}
    </div>
  )
}
