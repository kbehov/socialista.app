'use client'

import { cn } from '@/lib/utils'
import { getAspectRatioClass } from '@/utils/aspect-ratio'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type UgcPhonePreviewProps = {
  src: string
  poster?: string
  aspectRatio?: string
  className?: string
}

export function UgcPhonePreview({
  src,
  poster,
  aspectRatio = '9:16',
  className,
}: UgcPhonePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const node = videoRef.current
    if (!node) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    node.addEventListener('play', onPlay)
    node.addEventListener('pause', onPause)
    node.addEventListener('ended', onPause)
    return () => {
      node.removeEventListener('play', onPlay)
      node.removeEventListener('pause', onPause)
      node.removeEventListener('ended', onPause)
    }
  }, [src])

  const toggle = () => {
    const node = videoRef.current
    if (!node) return
    if (node.paused) {
      void node.play().catch(() => {})
      return
    }
    node.pause()
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-[240px] flex-col items-center', className)}>
      <div className="relative w-full overflow-hidden rounded-[1.75rem] bg-zinc-950 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/20 dark:ring-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
          <span className="h-1.5 w-16 rounded-full bg-white/25" />
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
          className={cn('relative w-full bg-black', getAspectRatioClass(aspectRatio))}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            playsInline
            loop
            src={src}
            poster={poster}
          />
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
              playing ? 'opacity-0' : 'opacity-100',
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-zinc-950 shadow-sm dark:bg-white/85">
              {playing ? (
                <PauseIcon className="size-4" />
              ) : (
                <PlayIcon className="size-4 fill-current" />
              )}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
