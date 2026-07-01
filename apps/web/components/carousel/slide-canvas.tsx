'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Slide } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { DEFAULT_SLIDE_BACKGROUND, sortLayers, DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT } from '@/lib/carousel/defaults'
import { fitSlideDisplaySize } from '@/lib/carousel/fit-slide-display'
import { TextLayerNode } from './text-layer-node'
import { SlideBackgroundImage } from './slide-background-image'
import { cn } from '@/lib/utils'

type SlideCanvasProps = {
  slide: Slide
  interactive: boolean
  className?: string
  maxWidth?: number
  /** Force a specific display width in px. Used for export at full resolution. */
  forceWidth?: number
  isBackgroundEditing?: boolean
  onBackgroundSelect?: () => void
  hideBackgroundImage?: boolean
}

export function SlideCanvas({
  slide,
  interactive,
  className,
  maxWidth,
  forceWidth,
  isBackgroundEditing = false,
  onBackgroundSelect,
  hideBackgroundImage = false,
}: SlideCanvasProps) {
  const canvas = useEditorStore(s => s.canvas)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setContainerSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const displaySize = useMemo(() => {
    if (forceWidth != null) {
      const height = forceWidth * (canvas.height / canvas.width)
      return { width: forceWidth, height }
    }
    return fitSlideDisplaySize(
      containerSize.width,
      containerSize.height,
      canvas.width,
      canvas.height,
      maxWidth,
    )
  }, [forceWidth, containerSize, canvas.width, canvas.height, maxWidth])

  const displayWidth = displaySize.width
  const displayHeight = displaySize.height
  const isMeasured = displayWidth > 0 && displayHeight > 0

  const scale = displayWidth > 0 ? displayWidth / canvas.width : 0
  const backgroundColor = slide.backgroundColor || DEFAULT_SLIDE_BACKGROUND
  const backgroundImageAdjustment = slide.backgroundImageAdjustment ?? DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT

  const isActiveSlide = activeSlideId === slide.id
  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return
    const target = e.target as HTMLElement
    if (target.dataset?.slot === 'canvas-bg-image') {
      e.stopPropagation()
      onBackgroundSelect?.()
      return
    }
    if (e.target === innerRef.current || target.dataset?.slot === 'canvas-bg') {
      setActiveLayer(slide.id, null)
    }
  }

  return (
    <div
      ref={outerRef}
      className={cn('flex h-full max-h-full min-h-0 w-full max-w-full items-center justify-center', className)}
    >
      <div
        ref={innerRef}
        data-slide-canvas={slide.id}
        onPointerDown={onCanvasPointerDown}
        className={cn('relative shrink-0 overflow-hidden', !isMeasured && 'invisible')}
        style={{
          width: isMeasured ? `${displayWidth}px` : undefined,
          height: isMeasured ? `${displayHeight}px` : undefined,
          maxWidth: '100%',
          maxHeight: '100%',
          backgroundColor,
        }}
      >
        <div data-slot="canvas-bg" className="absolute inset-0" style={{ backgroundColor }} />

        {slide.backgroundImageUrl && !hideBackgroundImage ? (
          <SlideBackgroundImage
            imageUrl={slide.backgroundImageUrl}
            adjustment={backgroundImageAdjustment}
            interactive={interactive}
            isBackgroundEditing={isBackgroundEditing}
            onSelect={interactive && onBackgroundSelect ? onBackgroundSelect : undefined}
            layoutWidth={isMeasured ? displayWidth : undefined}
            layoutHeight={isMeasured ? displayHeight : undefined}
          />
        ) : null}

        {scale > 0
          ? sortLayers(slide.layers).map(layer => (
              <TextLayerNode
                key={layer.id}
                layer={layer}
                slideId={slide.id}
                scale={scale}
                canvasRef={innerRef}
                selected={interactive && isActiveSlide && activeLayerId === layer.id}
                interactive={interactive}
              />
            ))
          : null}
      </div>
    </div>
  )
}
