'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 3
const DEFAULT_ZOOM = 1
const ZOOM_STEP = 0.25

type VideoZoomControlsProps = {
  zoom: number
  onZoomChange: (zoom: number) => void
  className?: string
}

export function VideoZoomControls({ zoom, onZoomChange, className }: VideoZoomControlsProps) {
  const percent = Math.round(zoom * 100)

  const zoomOut = () => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))
  const zoomIn = () => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))
  const resetZoom = () => onZoomChange(DEFAULT_ZOOM)

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
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom preview out"
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
        aria-label={`Preview zoom ${percent}%, click to reset`}
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
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom preview in"
          >
            <ZoomInIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>

      {zoom !== DEFAULT_ZOOM ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-7 rounded-full"
              onClick={resetZoom}
              aria-label="Reset preview zoom"
            >
              <RotateCcwIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to 100%</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
