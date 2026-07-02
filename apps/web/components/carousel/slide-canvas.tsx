'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CanvasDimensions, Slide } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { DEFAULT_SLIDE_BACKGROUND, sortLayers, DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT } from '@/lib/carousel/defaults'
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
  /** Override editor canvas dimensions (e.g. list previews). */
  canvasDimensions?: CanvasDimensions
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
  canvasDimensions,
  isBackgroundEditing = false,
  onBackgroundSelect,
  hideBackgroundImage = false,
}: SlideCanvasProps) {
  const storeCanvas = useEditorStore(s => s.canvas)
  const canvas = canvasDimensions ?? storeCanvas
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect()
      setContainerSize({ width, height })
    }

    updateSize()

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setContainerSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [canvas.width, canvas.height])

  const displaySize = useMemo(() => {
    if (forceWidth != null) {
      const height = forceWidth * (canvas.height / canvas.width)
      return { width: forceWidth, height }
    }

    if (containerSize.width <= 0 || canvas.width <= 0 || canvas.height <= 0) {
      return { width: 0, height: 0 }
    }

    const aspect = canvas.width / canvas.height
    let width = maxWidth ? Math.min(containerSize.width, maxWidth) : containerSize.width
    let height = width / aspect

    if (containerSize.height > 0 && height > containerSize.height) {
      height = containerSize.height
      width = height * aspect
    }

    return { width, height }
  }, [forceWidth, containerSize, canvas.width, canvas.height, maxWidth])

  const displayWidth = displaySize.width
  const displayHeight = displaySize.height
  const isMeasured = displayWidth > 0 && displayHeight > 0
  const isPortrait = canvas.height > canvas.width

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
      className={cn(
        'flex w-full max-w-full',
        isPortrait ? 'items-start justify-center' : 'min-h-full items-center justify-center',
        className,
      )}
    >
      <div
        ref={innerRef}
        data-slide-canvas={slide.id}
        onPointerDown={onCanvasPointerDown}
        className={cn(
          'relative shrink-0',
          interactive ? 'overflow-visible' : 'overflow-hidden',
          !isMeasured && 'invisible',
        )}
        style={{
          width: isMeasured ? `${displayWidth}px` : undefined,
          height: isMeasured ? `${displayHeight}px` : undefined,
          maxWidth: '100%',
          maxHeight: isPortrait ? undefined : '100%',
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
