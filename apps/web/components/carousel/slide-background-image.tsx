'use client'

import type { BackgroundImageAdjustment, BackgroundImageFilter, BackgroundImageTransform } from '@socialista/types'
import {
  backgroundImageStyle,
  backgroundImageTransformStyle,
  resolveBackgroundTransform,
  usesFrame,
} from '@/lib/carousel/background-image-style'
import { filtersToCss } from '@/lib/media-filters'
import {
  useBackgroundImageTransform,
  type TransformCorner,
} from '@/hooks/carousel/use-background-image-transform'
import { cn } from '@/lib/utils'
import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { SlideId } from '@socialista/types'
import {
  registerBackgroundTransformFlusher,
  unregisterBackgroundTransformFlusher,
} from '@/lib/carousel/background-transform-flush'

type SlideBackgroundImageProps = {
  imageUrl: string
  adjustment: BackgroundImageAdjustment
  filters?: BackgroundImageFilter[]
  slideId?: SlideId
  className?: string
  interactive?: boolean
  isBackgroundEditing?: boolean
  isBackgroundSelected?: boolean
  canvasRef?: RefObject<HTMLDivElement | null>
  onSelect?: () => void
  onTransformCommit?: (transform: BackgroundImageTransform) => void
  layoutWidth?: number
  layoutHeight?: number
  children?: ReactNode
}

function TransformHandle({
  corner,
  onPointerDown,
}: {
  corner: TransformCorner
  onPointerDown: (e: React.PointerEvent) => void
}) {
  const anchor =
    corner === 'nw'
      ? 'left-1.5 top-1.5 cursor-nwse-resize'
      : corner === 'ne'
        ? 'right-1.5 top-1.5 cursor-nesw-resize'
        : corner === 'se'
          ? 'right-1.5 bottom-1.5 cursor-nwse-resize'
          : 'left-1.5 bottom-1.5 cursor-nesw-resize'

  return (
    <div
      className={cn('absolute z-30 flex size-6 items-center justify-center pointer-events-auto touch-none', anchor)}
      onPointerDown={onPointerDown}
      aria-hidden
    >
      <div className="size-3.5 rounded-sm border-2 border-primary bg-background shadow-md ring-2 ring-background/80" />
    </div>
  )
}

export function SlideBackgroundImage({
  imageUrl,
  adjustment,
  filters = [],
  slideId,
  className,
  interactive,
  isBackgroundEditing,
  isBackgroundSelected,
  canvasRef,
  onSelect,
  onTransformCommit,
  layoutWidth,
  layoutHeight,
  children,
}: SlideBackgroundImageProps) {
  const transform = resolveBackgroundTransform(adjustment)
  const isFrame = usesFrame(adjustment)
  const imageStyle = backgroundImageStyle(adjustment)
  const filterStyle = filtersToCss(filters)
  const renderedImageStyle = filterStyle ? { filter: filterStyle } : undefined

  const width = layoutWidth ?? 0
  const height = layoutHeight ?? 0
  const isMeasured = width > 0 && height > 0

  const canEdit =
    interactive &&
    isFrame &&
    isBackgroundSelected &&
    Boolean(canvasRef) &&
    Boolean(onTransformCommit)

  const { draft, beginPan, beginScale, flushPendingCommit } = useBackgroundImageTransform({
    transform,
    canvasRef: canvasRef ?? { current: null },
    onCommit: onTransformCommit ?? (() => {}),
    enabled: canEdit,
  })

  useEffect(() => {
    if (!slideId || !canEdit) return
    registerBackgroundTransformFlusher(slideId, flushPendingCommit)
    return () => unregisterBackgroundTransformFlusher(slideId)
  }, [slideId, canEdit, flushPendingCommit])

  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setImageLoaded(false)
    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [imageUrl])

  const effectiveTransform = draft ?? transform

  const imageClassName = cn(
    'size-full object-cover select-none',
    interactive && !imageLoaded && 'opacity-0',
    interactive && onSelect && !canEdit && 'cursor-pointer hover:brightness-[0.97]',
    canEdit && 'cursor-grab active:cursor-grabbing',
    isBackgroundEditing && 'animate-pulse opacity-80 brightness-90',
    className,
  )

  const handleImagePointerDown = onSelect
    ? (event: React.PointerEvent) => {
        event.stopPropagation()
        onSelect()
      }
    : undefined

  if (isFrame && isMeasured) {
    return (
      <>
        <div data-slot="canvas-bg-image-wrap" className="absolute inset-0 overflow-hidden">
          <div
            className="h-full w-full"
            style={backgroundImageTransformStyle(effectiveTransform, width, height)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              key={imageUrl}
              data-slot="canvas-bg-image"
              src={imageUrl}
              alt=""
              className={imageClassName}
              style={renderedImageStyle}
              draggable={false}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              onPointerDown={canEdit ? beginPan : handleImagePointerDown}
            />
          </div>
        </div>

        {children}

        {canEdit ? (
          <div className="pointer-events-none absolute inset-0 z-40">
            <div className="absolute inset-0 border-2 border-dashed border-primary/70" />
            {(['nw', 'ne', 'se', 'sw'] as TransformCorner[]).map(corner => (
              <TransformHandle key={corner} corner={corner} onPointerDown={beginScale(corner)} />
            ))}
          </div>
        ) : null}
      </>
    )
  }

  if (adjustment.type === 'crop') {
    return (
      <>
        <div data-slot="canvas-bg-image-wrap" className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            data-slot="canvas-bg-image"
            src={imageUrl}
            alt=""
            className={cn('absolute inset-0 size-full object-cover select-none', imageClassName)}
            style={{ ...imageStyle, ...renderedImageStyle }}
            draggable={false}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            onPointerDown={handleImagePointerDown}
          />
        </div>
        {children}
      </>
    )
  }

  return null
}
