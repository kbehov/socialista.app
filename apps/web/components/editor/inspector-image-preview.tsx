'use client'

import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type CanvasSize = { width: number; height: number }

type InspectorImagePreviewProps = {
  imageUrl?: string | null
  canvas: CanvasSize
  alt: string
  filterCss?: string
  objectFit?: 'cover' | 'contain'
  opacity?: number
  rotation?: number
  className?: string
}

export function InspectorImagePreview({
  imageUrl,
  canvas,
  alt,
  filterCss,
  objectFit = 'cover',
  opacity = 1,
  rotation,
  className,
}: InspectorImagePreviewProps) {
  const frameStyle = { aspectRatio: `${canvas.width} / ${canvas.height}` }
  const imageStyle: React.CSSProperties = {
    objectFit,
    opacity,
    filter: filterCss || undefined,
  }

  if (!imageUrl) {
    return (
      <div
        className={cn(
          'mx-auto flex w-full max-w-[200px] items-center justify-center rounded-md border border-dashed bg-muted/30',
          className,
        )}
        style={frameStyle}
      >
        <ImageIcon className="size-8 text-muted-foreground/50" />
      </div>
    )
  }

  if (rotation != null) {
    return (
      <div
        className={cn(
          'relative mx-auto w-full max-w-[200px] overflow-hidden rounded-md border bg-muted shadow-xs',
          className,
        )}
        style={frameStyle}
      >
        <div
          className="absolute inset-[15%] flex items-center justify-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={alt} className="max-h-full max-w-full" style={imageStyle} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[200px] overflow-hidden rounded-md border bg-muted shadow-xs',
        className,
      )}
      style={frameStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="size-full object-cover" style={imageStyle} />
    </div>
  )
}
