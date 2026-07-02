'use client'

import { TransformWrapper, TransformComponent, useTransformEffect } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'

type ZoomPanTransform = {
  scale: number
  positionX: number
  positionY: number
}

export const ZOOM_PAN_MIN_SCALE = 1
export const ZOOM_PAN_MAX_SCALE = 4

type ZoomPanControls = {
  zoomIn: () => void
  zoomOut: () => void
  resetTransform: () => void
  /** Reset to cover-fit (scale 1, centered). Use for the "Reset" button. */
  centerView: (scale?: number) => void
  /** Imperatively set the transform (positions in px, scale 1..4). */
  setTransform: (positionX: number, positionY: number, scale: number) => void
}

type BackgroundImageZoomPanProps = {
  imageUrl: string
  scale: number
  positionX: number
  positionY: number
  /** When true, pan/zoom controls are locked (preview/export). */
  readonly?: boolean
  className?: string
  onSelect?: () => void
  onTransform?: (transform: ZoomPanTransform) => void
  children?: (controls: ZoomPanControls) => React.ReactNode
}

function TransformListener({ onTransform }: { onTransform?: (transform: ZoomPanTransform) => void }) {
  useTransformEffect(({ state }) => {
    onTransform?.({
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY,
    })
  })
  return null
}

function ReadonlyZoomPanPreview({
  imageUrl,
  scale,
  positionX,
  positionY,
  className,
  onSelect,
}: Pick<
  BackgroundImageZoomPanProps,
  'imageUrl' | 'scale' | 'positionX' | 'positionY' | 'className' | 'onSelect'
>) {
  return (
    <div className="size-full overflow-hidden">
      <div
        className="size-full will-change-transform"
        style={{ transform: `translate(${positionX}px, ${positionY}px) scale(${scale})` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-slot="canvas-bg-image"
          src={imageUrl}
          alt=""
          className={cn('size-full object-cover select-none', className)}
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
    </div>
  )
}

export function BackgroundImageZoomPan({
  imageUrl,
  scale,
  positionX,
  positionY,
  readonly = false,
  className,
  onSelect,
  onTransform,
  children,
}: BackgroundImageZoomPanProps) {
  if (readonly) {
    return (
      <ReadonlyZoomPanPreview
        imageUrl={imageUrl}
        scale={scale}
        positionX={positionX}
        positionY={positionY}
        className={className}
        onSelect={onSelect}
      />
    )
  }

  return (
    <div className="size-full">
      <TransformWrapper
        initialScale={Math.max(ZOOM_PAN_MIN_SCALE, scale)}
        initialPositionX={positionX}
        initialPositionY={positionY}
        minScale={ZOOM_PAN_MIN_SCALE}
        maxScale={ZOOM_PAN_MAX_SCALE}
        limitToBounds
        centerOnInit={false}
        disablePadding
        wheel={{ step: 0.08 }}
        pinch={{ step: 0.08 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        {controls => (
          <>
            <TransformListener onTransform={onTransform} />
            <TransformComponent
              wrapperClass="!size-full"
              contentClass="!size-full"
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-slot="canvas-bg-image"
                src={imageUrl}
                alt=""
                className={cn('size-full object-cover select-none', className)}
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
            </TransformComponent>
            {children?.({
              zoomIn: controls.zoomIn,
              zoomOut: controls.zoomOut,
              resetTransform: controls.resetTransform,
              centerView: controls.centerView,
              setTransform: controls.setTransform,
            })}
          </>
        )}
      </TransformWrapper>
    </div>
  )
}

export type { ZoomPanTransform }
