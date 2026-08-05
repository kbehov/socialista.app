'use client'

import { CanvasZoomControls as EditorCanvasZoomControls } from '@/components/editor/canvas-zoom-controls'
import { useEditorStore } from '@/lib/carousel/store'

type CarouselCanvasZoomControlsProps = {
  className?: string
}

/** Carousel adapter: binds shared zoom controls to the slideshow store. */
export function CanvasZoomControls({ className }: CarouselCanvasZoomControlsProps) {
  const viewportZoom = useEditorStore(s => s.viewportZoom)
  const setViewportZoom = useEditorStore(s => s.setViewportZoom)

  return (
    <EditorCanvasZoomControls
      zoom={viewportZoom}
      onZoomChange={setViewportZoom}
      className={className}
    />
  )
}
