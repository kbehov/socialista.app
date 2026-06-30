'use client'

import { useEditorStore } from '@/lib/carousel/store'
import type { Slide, TextLayer } from '@socialista/types'

export function useActiveLayer(): { slide: Slide | null; layer: TextLayer | null } {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const layerId = useEditorStore(s => s.activeLayerId)
  const layer = slide?.layers.find(l => l.id === layerId) ?? null
  return { slide, layer }
}
