'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Slide } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { DEFAULT_SLIDE_BACKGROUND, sortLayers } from '@/lib/carousel/defaults'
import { TextLayerNode } from './text-layer-node'
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
}

function fitDisplayWidth(
  containerWidth: number,
  containerHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  maxWidth?: number,
): number {
  if (containerWidth <= 0 || containerHeight <= 0) return 0

  const cappedWidth = maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth
  const heightAtCappedWidth = cappedWidth * (canvasHeight / canvasWidth)

  if (heightAtCappedWidth <= containerHeight) return cappedWidth

  return containerHeight * (canvasWidth / canvasHeight)
}

export function SlideCanvas({
  slide,
  interactive,
  className,
  maxWidth,
  forceWidth,
  isBackgroundEditing = false,
  onBackgroundSelect,
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

  const displayWidth = useMemo(() => {
    if (forceWidth != null) return forceWidth
    return fitDisplayWidth(
      containerSize.width,
      containerSize.height,
      canvas.width,
      canvas.height,
      maxWidth,
    )
  }, [forceWidth, containerSize, canvas.width, canvas.height, maxWidth])

  const scale = displayWidth > 0 ? displayWidth / canvas.width : 0
  const backgroundColor = slide.backgroundColor || DEFAULT_SLIDE_BACKGROUND

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
    <div ref={outerRef} className={cn('flex h-full w-full items-center justify-center', className)}>
      <div
        ref={innerRef}
        data-slide-canvas={slide.id}
        onPointerDown={onCanvasPointerDown}
        className="relative overflow-hidden rounded-sm border border-border/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
        style={{
          width: displayWidth > 0 ? `${displayWidth}px` : '100%',
          aspectRatio: `${canvas.width} / ${canvas.height}`,
          backgroundColor,
        }}
      >
        <div data-slot="canvas-bg" className="absolute inset-0" style={{ backgroundColor }} />

        {slide.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-slot="canvas-bg-image"
            src={slide.backgroundImageUrl}
            alt=""
            className={cn(
              'absolute inset-0 size-full object-cover transition-[filter,opacity] duration-500',
              interactive && onBackgroundSelect && 'cursor-pointer',
              isBackgroundEditing && 'animate-pulse opacity-80 brightness-90',
            )}
            draggable={false}
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
