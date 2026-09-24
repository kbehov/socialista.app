'use client'

import { isVideoPreviewUrl } from '@/lib/studio/template-media'
import { cn } from '@/lib/utils'

type StudioTemplatePreviewMediaProps = {
  url: string
  alt?: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
}

export function StudioTemplatePreviewMedia({
  url,
  alt = '',
  className,
  controls = false,
  autoPlay = false,
}: StudioTemplatePreviewMediaProps) {
  if (isVideoPreviewUrl(url)) {
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
