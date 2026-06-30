'use client'

import { useEffect, useRef, useState } from 'react'
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
}

export function SlideCanvas({ slide, interactive, className, maxWidth, forceWidth }: SlideCanvasProps) {
  const canvas = useEditorStore(s => s.canvas)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const displayWidth = forceWidth ?? (maxWidth ? Math.min(containerWidth, maxWidth) : containerWidth)
  const scale = displayWidth > 0 ? displayWidth / canvas.width : 0
  const backgroundColor = slide.backgroundColor || DEFAULT_SLIDE_BACKGROUND

  const isActiveSlide = activeSlideId === slide.id
  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return
    if (e.target === innerRef.current || (e.target as HTMLElement).dataset?.slot === 'canvas-bg') {
      setActiveLayer(slide.id, null)
    }
  }

  return (
    <div ref={outerRef} className={cn('flex w-full justify-center', className)}>
      <div
        ref={innerRef}
        data-slide-canvas={slide.id}
        onPointerDown={onCanvasPointerDown}
        className="relative overflow-hidden rounded-lg border shadow-sm"
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
            data-slot="canvas-bg"
            src={slide.backgroundImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
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
