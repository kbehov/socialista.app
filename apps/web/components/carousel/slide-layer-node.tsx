'use client'

import { memo } from 'react'
import type { RefObject } from 'react'
import type { SlideId, SlideLayer } from '@socialista/types'
import { TextLayerNode } from '@/components/carousel/text-layer-node'
import { ImageLayerNode } from '@/components/carousel/image-layer-node'

type SlideLayerNodeProps = {
  layer: SlideLayer
  slideId: SlideId
  scale: number
  canvasRef: RefObject<HTMLDivElement | null>
  selected: boolean
  interactive: boolean
  selectable?: boolean
}

export const SlideLayerNode = memo(function SlideLayerNode({
  layer,
  slideId,
  scale,
  canvasRef,
  selected,
  interactive,
  selectable,
}: SlideLayerNodeProps) {
  if (layer.type === 'text') {
    return (
      <TextLayerNode
        layer={layer}
        slideId={slideId}
        scale={scale}
        canvasRef={canvasRef}
        selected={selected}
        interactive={interactive}
        selectable={selectable}
      />
    )
  }

  return (
    <ImageLayerNode
      layer={layer}
      slideId={slideId}
      canvasRef={canvasRef}
      selected={selected}
      interactive={interactive}
      selectable={selectable}
    />
  )
})
