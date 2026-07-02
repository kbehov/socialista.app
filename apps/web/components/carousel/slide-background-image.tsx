'use client'

import type { BackgroundImageAdjustment } from '@socialista/types'
import {
  backgroundImageContainerStyle,
  backgroundImageStyle,
  resolveZoomPanPosition,
  usesObjectCover,
  usesZoomPan,
} from '@/lib/carousel/background-image-style'
import { BackgroundImageZoomPan } from '@/components/carousel/background-image-zoom-pan'
import { cn } from '@/lib/utils'

type SlideBackgroundImageProps = {
  imageUrl: string
  adjustment: BackgroundImageAdjustment
  className?: string
  interactive?: boolean
  isBackgroundEditing?: boolean
  onSelect?: () => void
  /** Known layout size from the slide canvas; avoids a second measure pass. */
  layoutWidth?: number
  layoutHeight?: number
}

export function SlideBackgroundImage({
  imageUrl,
  adjustment,
  className,
  interactive,
  isBackgroundEditing,
  onSelect,
  layoutWidth,
  layoutHeight,
}: SlideBackgroundImageProps) {
  const objectCover = usesObjectCover(adjustment)
  const zoomPan = usesZoomPan(adjustment)
  const containerStyle = backgroundImageContainerStyle(adjustment)
  const imageStyle = backgroundImageStyle(adjustment)

  const width = layoutWidth ?? 0
  const height = layoutHeight ?? 0
  const isMeasured = width > 0 && height > 0

  const zoomTransform =
    zoomPan && isMeasured ? resolveZoomPanPosition(adjustment, width, height) : null

  const imageClassName = cn(
    interactive && onSelect && 'cursor-pointer transition-[filter,opacity] hover:brightness-[0.97]',
    isBackgroundEditing && 'animate-pulse opacity-80 brightness-90',
    className,
  )

  if (objectCover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        data-slot="canvas-bg-image"
        src={imageUrl}
        alt=""
        className={cn('absolute inset-0 size-full object-cover select-none', imageClassName)}
        draggable={false}
        onPointerDown={
          onSelect
            ? event => {
                event.stopPropagation()
                onSelect()
              }
            : undefined
        }
      />
    )
  }

  if (zoomPan && zoomTransform) {
    return (
      <div
        data-slot="canvas-bg-image-wrap"
        className="absolute inset-0 overflow-hidden"
        style={containerStyle}
      >
        <BackgroundImageZoomPan
          key={`${width}-${height}-${adjustment.scale}-${adjustment.positionX}-${adjustment.positionY}`}
          imageUrl={imageUrl}
          scale={zoomTransform.scale}
          positionX={zoomTransform.positionX}
          positionY={zoomTransform.positionY}
          readonly
          className={imageClassName}
          onSelect={onSelect}
        />
      </div>
    )
  }

  return (
    <div
      data-slot="canvas-bg-image-wrap"
      className="absolute inset-0 overflow-hidden"
      style={containerStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-slot="canvas-bg-image"
        src={imageUrl}
        alt=""
        className={cn('absolute inset-0 size-full object-cover select-none', imageClassName)}
        style={imageStyle}
        draggable={false}
        onPointerDown={
          onSelect
            ? event => {
                event.stopPropagation()
                onSelect()
              }
            : undefined
        }
      />
    </div>
  )
}
