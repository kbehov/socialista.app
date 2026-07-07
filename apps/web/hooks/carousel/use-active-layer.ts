'use client'

import { useEditorStore } from '@/lib/carousel/store'
import type { Slide, SlideLayer } from '@socialista/types'

export function useActiveLayer(): { slide: Slide | null; layer: SlideLayer | null } {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const layerId = useEditorStore(s => s.activeLayerId)
  const layer = slide?.layers.find(l => l.id === layerId) ?? null
  return { slide, layer }
}
