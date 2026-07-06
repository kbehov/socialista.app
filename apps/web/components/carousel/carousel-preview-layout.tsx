'use client'

import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { fitCarouselPreviewInWorkspace } from '@/lib/carousel/canvas-viewport'
import { useEditorStore } from '@/lib/carousel/store'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type CarouselPreviewLayout = {
  baseWidth: number
  baseHeight: number
  visualWidth: number
  visualHeight: number
  zoom: number
  scale: number
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
    if (workspaceSize.width <= 0 || workspaceSize.height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
      return null
    }

    const zoom = Math.max(viewportZoom, 0.01)
    const base = fitCarouselPreviewInWorkspace(
      Math.max(1, workspaceSize.width / zoom),
      Math.max(1, workspaceSize.height / zoom),
      canvas.width,
      canvas.height,
    )

    if (base.width <= 0 || base.height <= 0) return null

    return {
      baseWidth: base.width,
      baseHeight: base.height,
      visualWidth: Math.round(base.width * zoom),
      visualHeight: Math.round(base.height * zoom),
      zoom,
      scale: base.width / canvas.width,
    }
  }, [workspaceSize.width, workspaceSize.height, canvas.width, canvas.height, viewportZoom])

  return (
    <CarouselPreviewLayoutContext.Provider value={layout}>{children}</CarouselPreviewLayoutContext.Provider>
  )
}
