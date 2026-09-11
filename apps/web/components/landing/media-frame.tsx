'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'

type MediaFrameProps = {
  src?: string
  video?: string
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  objectPosition?: string
}

export function MediaFrame({
  src,
  video,
  alt = '',
  className,
  sizes = '(max-width: 768px) 50vw, 280px',
  priority = false,
  objectPosition = '50% 18%',
}: MediaFrameProps) {
  const reduceMotion = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)
  const showVideo = Boolean(video) && !reduceMotion

  return (
    <div className={cn('relative overflow-hidden bg-surface-0', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
      ) : null}
      {showVideo ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setVideoReady(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-300',
            videoReady ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition }}
        />
      ) : null}
    </div>
  )
}
