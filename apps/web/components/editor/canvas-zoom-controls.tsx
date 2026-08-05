'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DEFAULT_VIEWPORT_ZOOM,
  MAX_VIEWPORT_ZOOM,
  MIN_VIEWPORT_ZOOM,
  VIEWPORT_ZOOM_STEP,
  clampViewportZoom,
} from '@/lib/editor/zoom'
import { cn } from '@/lib/utils'
import { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'

type CanvasZoomControlsProps = {
  zoom: number
  onZoomChange: (zoom: number) => void
  min?: number
  max?: number
  defaultZoom?: number
  step?: number
  className?: string
}

export function CanvasZoomControls({
  zoom,
  onZoomChange,
  min = MIN_VIEWPORT_ZOOM,
  max = MAX_VIEWPORT_ZOOM,
  defaultZoom = DEFAULT_VIEWPORT_ZOOM,
  step = VIEWPORT_ZOOM_STEP,
  className,
}: CanvasZoomControlsProps) {
  const percent = Math.round(zoom * 100)
  const zoomOut = () => onZoomChange(clampViewportZoom(Math.max(min, zoom - step)))
  const zoomIn = () => onZoomChange(clampViewportZoom(Math.min(max, zoom + step)))
  const resetZoom = () => onZoomChange(defaultZoom)

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
            disabled={zoom <= min}
            aria-label="Zoom canvas out"
          >
            <ZoomOutIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom out</TooltipContent>
      </Tooltip>

      <button
        type="button"
        className="min-w-12 px-1 text-center text-[11px] font-medium tabular-nums text-muted-foreground hover:text-foreground"
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
            disabled={zoom >= max}
            aria-label="Zoom canvas in"
          >
            <ZoomInIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>

      {zoom !== defaultZoom ? (
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
          <TooltipContent>Reset to {Math.round(defaultZoom * 100)}%</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
