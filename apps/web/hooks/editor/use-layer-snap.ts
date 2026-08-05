'use client'

import { useCanvasGuides } from '@/components/editor/canvas-guides'
import type { SnapGuide, SnapTarget } from '@/lib/editor/snap-guides'
import { useCallback, useMemo } from 'react'

/**
 * Shared canvas snap wiring. Pass sibling layer/clip/overlay targets;
 * guides are pushed to the nearest CanvasGuidesProvider.
 */
export function useLayerSnap(opts: {
  others: SnapTarget[]
  enabled?: boolean
}) {
  const { others, enabled = true } = opts
  const guides = useCanvasGuides()

  const snapTargets = useMemo(() => (enabled ? others : []), [enabled, others])

  const onGuidesChange = useCallback(
    (next: SnapGuide[]) => {
      if (!guides || !enabled) return
      if (next.length === 0) guides.clearGuides()
      else guides.setGuides(next)
    },
    [enabled, guides],
  )

  return {
    snapTargets,
    onGuidesChange: guides && enabled ? onGuidesChange : undefined,
  }
}
