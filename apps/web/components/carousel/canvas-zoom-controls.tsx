'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DEFAULT_VIEWPORT_ZOOM,
  MAX_VIEWPORT_ZOOM,
  MIN_VIEWPORT_ZOOM,
} from '@/lib/carousel/defaults'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'

type CanvasZoomControlsProps = {
  className?: string
}

export function CanvasZoomControls({ className }: CanvasZoomControlsProps) {
  const viewportZoom = useEditorStore(s => s.viewportZoom)
  const zoomIn = useEditorStore(s => s.zoomViewportIn)
  const zoomOut = useEditorStore(s => s.zoomViewportOut)
  const resetZoom = useEditorStore(s => s.resetViewportZoom)

  const percent = Math.round(viewportZoom * 100)

  return (
    <div
      data-canvas-controls
      className={cn(
        'pointer-events-auto flex items-center gap-0.5 rounded-full border bg-background/95 p-0.5 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={zoomOut}
            disabled={viewportZoom <= MIN_VIEWPORT_ZOOM}
            aria-label="Zoom canvas out"
          >
            <ZoomOutIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom out</TooltipContent>
      </Tooltip>

      <button
        type="button"
        className="min-w-[3rem] px-1 text-center text-[11px] font-medium tabular-nums text-muted-foreground hover:text-foreground"
        onClick={resetZoom}
        aria-label={`Canvas zoom ${percent}%, click to reset`}
      >
        {percent}%
      </button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-7 rounded-full"
            onClick={zoomIn}
            disabled={viewportZoom >= MAX_VIEWPORT_ZOOM}
            aria-label="Zoom canvas in"
          >
            <ZoomInIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>

      {viewportZoom !== DEFAULT_VIEWPORT_ZOOM ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-7 rounded-full"
              onClick={resetZoom}
              aria-label="Reset canvas zoom"
            >
              <RotateCcwIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to {Math.round(DEFAULT_VIEWPORT_ZOOM * 100)}%</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
