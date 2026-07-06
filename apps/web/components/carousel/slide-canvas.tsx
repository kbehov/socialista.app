'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BackgroundImageTransform, CanvasDimensions, Slide } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { DEFAULT_SLIDE_BACKGROUND, sortLayers, DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT } from '@/lib/carousel/defaults'
import { transformToAdjustment, usesFrame } from '@/lib/carousel/background-image-style'
import { fitArtboardInWorkspace, fitSlideshowArtboardInWorkspace } from '@/lib/carousel/canvas-viewport'
import { useCanvasWorkspaceSize, useCanvasWorkspaceLayout } from '@/components/carousel/canvas-workspace-context'
import { TextLayerNode } from './text-layer-node'
import { SlideBackgroundImage } from './slide-background-image'
import { cn } from '@/lib/utils'
import { MousePointer2Icon } from 'lucide-react'

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
  isBackgroundSelected?: boolean
  onBackgroundSelect?: () => void
  onClearSelection?: () => void
  hideBackgroundImage?: boolean
  canvasHint?: string | null
  backgroundToolbar?: ReactNode
}

export function SlideCanvas({
  slide,
  interactive,
  className,
  maxWidth,
  forceWidth,
  canvasDimensions,
  isBackgroundEditing = false,
  isBackgroundSelected = false,
  onBackgroundSelect,
  onClearSelection,
  hideBackgroundImage = false,
  canvasHint,
  backgroundToolbar,
}: SlideCanvasProps) {
  const storeCanvas = useEditorStore(s => s.canvas)
  const viewportZoom = useEditorStore(s => s.viewportZoom)
  const setSlideBackgroundImageAdjustment = useEditorStore(s => s.setSlideBackgroundImageAdjustment)
  const canvas = canvasDimensions ?? storeCanvas
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const workspaceSize = useCanvasWorkspaceSize()
  const { capPreviewHeight } = useCanvasWorkspaceLayout()

  const fallbackRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fallbackSize, setFallbackSize] = useState({ width: 0, height: 0 })

  const hasWorkspaceMeasure = workspaceSize.width > 0 && workspaceSize.height > 0
  const usesWorkspace = forceWidth == null && hasWorkspaceMeasure
  const measureSize = usesWorkspace ? workspaceSize : fallbackSize

  useEffect(() => {
    if (usesWorkspace) return
    const el = fallbackRef.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const w = Math.round(width)
      const h = Math.round(height)
      setFallbackSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }))
    }

    update()
    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    return () => observer.disconnect()
  }, [usesWorkspace, canvas.width, canvas.height])

  const baseSize = useMemo(() => {
    if (forceWidth != null) {
      return {
        width: forceWidth,
        height: Math.round(forceWidth * (canvas.height / canvas.width)),
      }
    }

    if (measureSize.width <= 0 || measureSize.height <= 0) {
      return { width: 0, height: 0 }
    }

    if (usesWorkspace) {
      return fitSlideshowArtboardInWorkspace(
        measureSize.width,
        measureSize.height,
        canvas.width,
        canvas.height,
        { capPreviewHeight },
      )
    }

    return fitArtboardInWorkspace(
      measureSize.width,
      measureSize.height,
      canvas.width,
      canvas.height,
      16,
    )
  }, [forceWidth, measureSize, canvas.width, canvas.height, usesWorkspace, capPreviewHeight])

  const usesEditorViewport = forceWidth == null
  const zoom = usesEditorViewport ? viewportZoom : 1
  const baseWidth = baseSize.width
  const baseHeight = baseSize.height
  const visualWidth = Math.round(baseWidth * zoom)
  const visualHeight = Math.round(baseHeight * zoom)
  const isMeasured = baseWidth > 0 && baseHeight > 0

  const scale = baseWidth > 0 ? baseWidth / canvas.width : 0
  const backgroundColor = slide.backgroundColor || DEFAULT_SLIDE_BACKGROUND
  const backgroundImageAdjustment = slide.backgroundImageAdjustment ?? DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT

  const handleTransformCommit = (transform: BackgroundImageTransform) => {
    setSlideBackgroundImageAdjustment(slide.id, transformToAdjustment(transform))
  }

  const isAdjustingBackground = isBackgroundSelected && Boolean(slide.backgroundImageUrl)

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
      onClearSelection?.()
      return
    }
    if (e.target === e.currentTarget) {
      onClearSelection?.()
      setActiveLayer(slide.id, null)
    }
  }

  return (
    <div
      ref={usesWorkspace ? undefined : fallbackRef}
      className={cn(
        'flex h-full w-full items-center justify-center',
        !usesWorkspace && 'relative min-h-0',
        className,
      )}
      onPointerDown={interactive ? onCanvasPointerDown : undefined}
    >
      <div
        className={cn('relative shrink-0', !isMeasured && 'invisible')}
        style={{
          width: isMeasured ? visualWidth : undefined,
          height: isMeasured ? visualHeight : undefined,
        }}
      >
        <div className="relative size-full">
          <div
            ref={innerRef}
            data-slide-canvas={slide.id}
            onPointerDown={onCanvasPointerDown}
            className={cn(
              'absolute inset-0',
              isAdjustingBackground ? 'overflow-visible' : 'overflow-hidden',
              interactive && 'rounded-sm shadow-lg ring-1 ring-black/10',
              isAdjustingBackground && 'ring-2 ring-primary/40',
            )}
            style={{
              width: isMeasured ? baseWidth : undefined,
              height: isMeasured ? baseHeight : undefined,
              transform: isMeasured && zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top left',
              backgroundColor,
            }}
          >
            <div
              data-slot="canvas-bg"
              className={cn('absolute inset-0', isAdjustingBackground && 'opacity-0')}
              style={{ backgroundColor }}
            />

            {slide.backgroundImageUrl && !hideBackgroundImage ? (
              <SlideBackgroundImage
                imageUrl={slide.backgroundImageUrl}
                slideId={slide.id}
                adjustment={backgroundImageAdjustment}
                filters={slide.backgroundImageFilters}
                interactive={interactive}
                isBackgroundEditing={isBackgroundEditing}
                isBackgroundSelected={isBackgroundSelected && usesFrame(backgroundImageAdjustment)}
                canvasRef={innerRef}
                onSelect={interactive && onBackgroundSelect ? onBackgroundSelect : undefined}
                onTransformCommit={interactive ? handleTransformCommit : undefined}
                layoutWidth={isMeasured ? baseWidth : undefined}
                layoutHeight={isMeasured ? baseHeight : undefined}
              >
                {scale > 0
                  ? sortLayers(slide.layers).map(layer => (
                      <TextLayerNode
                        key={layer.id}
                        layer={layer}
                        slideId={slide.id}
                        scale={scale}
                        canvasRef={innerRef}
                        selected={interactive && isActiveSlide && activeLayerId === layer.id}
                        interactive={interactive && !isAdjustingBackground}
                        selectable={interactive}
                      />
                    ))
                  : null}
              </SlideBackgroundImage>
            ) : scale > 0 ? (
              sortLayers(slide.layers).map(layer => (
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
            ) : null}
          </div>
        </div>

        {canvasHint ? (
          <div
            data-canvas-hint
            className="pointer-events-none absolute top-full left-1/2 z-10 mt-2.5 w-max max-w-[min(100vw,20rem)] -translate-x-1/2 px-2"
          >
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-md">
              <MousePointer2Icon className="size-3.5 shrink-0 text-primary/80" />
              <span className="text-center">{canvasHint}</span>
            </div>
          </div>
        ) : null}

        {backgroundToolbar ? (
          <div
            className="pointer-events-none absolute top-1/2 left-full z-10 ml-3 -translate-y-1/2"
            data-bg-edit-toolbar
          >
            {backgroundToolbar}
          </div>
        ) : null}
      </div>
    </div>
  )
}
