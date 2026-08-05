'use client'

import { useMemo } from 'react'
import { useLayerSnap as useEditorLayerSnap } from '@/hooks/editor/use-layer-snap'
import { useEditorStore } from '@/lib/carousel/store'
import type { SnapTarget } from '@/lib/editor/snap-guides'
import type { LayerId, SlideId } from '@socialista/types'

/** Carousel adapter: resolves sibling layers from the editor store. */
export function useLayerSnap(slideId: SlideId, layerId: LayerId) {
  const layers = useEditorStore(s => s.slides.find(item => item.id === slideId)?.layers)
  const snapEnabled = useEditorStore(s => s.snapEnabled)

  const others = useMemo<SnapTarget[]>(() => {
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

  return useEditorLayerSnap({ others, enabled: snapEnabled })
}
