'use client'

import { useCanvasGuides } from '@/components/carousel/canvas-guides'
import { useEditorStore } from '@/lib/carousel/store'
import type { SnapTarget } from '@/lib/carousel/snap-guides'
import type { LayerId, SlideId } from '@socialista/types'
import { useCallback, useMemo } from 'react'

export function useLayerSnap(slideId: SlideId, layerId: LayerId) {
  const guides = useCanvasGuides()
  const layers = useEditorStore(s => s.slides.find(item => item.id === slideId)?.layers)

  const snapTargets = useMemo<SnapTarget[]>(() => {
    if (!layers) return []
    return layers
      .filter(layer => layer.id !== layerId)
      .map(layer => ({
        id: layer.id,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
      }))
  }, [layerId, layers])

  const onGuidesChange = useCallback(
    (next: { orientation: 'vertical' | 'horizontal'; position: number }[]) => {
      if (!guides) return
      if (next.length === 0) guides.clearGuides()
      else guides.setGuides(next)
    },
    [guides],
  )

  return {
    snapTargets,
    onGuidesChange: guides ? onGuidesChange : undefined,
  }
}
