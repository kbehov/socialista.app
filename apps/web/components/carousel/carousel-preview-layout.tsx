'use client'

import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import {
  VERTICAL_STACK_SLIDE_GAP,
  fitVerticalStackSlideInWorkspace,
} from '@/lib/carousel/canvas-viewport'
import { useEditorStore } from '@/lib/carousel/store'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type CarouselPreviewLayout = {
  baseWidth: number
  baseHeight: number
  visualWidth: number
  visualHeight: number
  zoom: number
  scale: number
  slideGap: number
}

const CarouselPreviewLayoutContext = createContext<CarouselPreviewLayout | null>(null)

export function useCarouselPreviewLayout(): CarouselPreviewLayout | null {
  return useContext(CarouselPreviewLayoutContext)
}

export function CarouselPreviewLayoutProvider({ children }: { children: ReactNode }) {
  const workspaceSize = useCanvasWorkspaceSize()
  const viewportZoom = useEditorStore(s => s.viewportZoom)
  const canvas = useEditorStore(s => s.canvas)

  const layout = useMemo<CarouselPreviewLayout | null>(() => {
    if (
      workspaceSize.width <= 0 ||
      workspaceSize.height <= 0 ||
      canvas.width <= 0 ||
      canvas.height <= 0
    ) {
      return null
    }

    const zoom = Math.max(viewportZoom, 0.01)
    const base = fitVerticalStackSlideInWorkspace(
      workspaceSize.width,
      workspaceSize.height,
      canvas.width,
      canvas.height,
    )

    if (base.width <= 0 || base.height <= 0) return null

    const visualWidth = Math.round(base.width * zoom)
    const visualHeight = Math.round(base.height * zoom)

    return {
      baseWidth: base.width,
      baseHeight: base.height,
      visualWidth,
      visualHeight,
      zoom,
      scale: visualWidth / canvas.width,
      slideGap: VERTICAL_STACK_SLIDE_GAP,
    }
  }, [workspaceSize.width, workspaceSize.height, canvas.width, canvas.height, viewportZoom])

  return (
    <CarouselPreviewLayoutContext.Provider value={layout}>{children}</CarouselPreviewLayoutContext.Provider>
  )
}
