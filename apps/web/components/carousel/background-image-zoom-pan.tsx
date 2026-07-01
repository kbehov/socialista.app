'use client'

import { TransformWrapper, TransformComponent, useTransformEffect } from 'react-zoom-pan-pinch'
import { cn } from '@/lib/utils'

type ZoomPanTransform = {
  scale: number
  positionX: number
  positionY: number
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
  children?: (controls: {
    zoomIn: () => void
    zoomOut: () => void
    resetTransform: () => void
  }) => React.ReactNode
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
  return (
    <div className="size-full">
      <TransformWrapper
        initialScale={scale}
      initialPositionX={positionX}
      initialPositionY={positionY}
      minScale={readonly ? scale : 0.5}
      maxScale={readonly ? scale : 4}
      disabled={readonly}
      limitToBounds={false}
      centerOnInit={false}
      disablePadding
      wheel={readonly ? { disabled: true } : { step: 0.08 }}
      pinch={readonly ? { disabled: true } : { step: 0.08 }}
      panning={readonly ? { disabled: true } : { velocityDisabled: true }}
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
          {children?.(controls)}
        </>
      )}
    </TransformWrapper>
    </div>
  )
}

export type { ZoomPanTransform }
