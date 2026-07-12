'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAiComingSoonOptional } from '@/components/video/ai/ai-coming-soon-dialog'
import { PreviewControls } from '@/components/video/preview/preview-controls'
import { VideoZoomControls } from '@/components/video/preview/video-zoom-controls'
import { useVideoEditorStore } from '@/lib/video/store'
import { ScissorsIcon, SparklesIcon, TypeIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'

type Playback = {
  toggle: () => void
  seekTo: (time: number) => void
}

type TimelineTransportProps = {
  playback: Playback
  onAddText: () => void
  onSplit: () => void
  canSplit: boolean
  previewZoom: number
  onPreviewZoomChange: (zoom: number) => void
}

function TimelineZoomButton({ direction, children }: { direction: 1 | -1; children: React.ReactNode }) {
  const zoomIn = useVideoEditorStore(s => s.zoomIn)
  const zoomOut = useVideoEditorStore(s => s.zoomOut)

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className="size-7"
      onClick={() => (direction > 0 ? zoomIn() : zoomOut())}
      aria-label={direction > 0 ? 'Zoom timeline in' : 'Zoom timeline out'}
    >
      {children}
    </Button>
  )
}

export function TimelineTransport({
  playback,
  onAddText,
  onSplit,
  canSplit,
  previewZoom,
  onPreviewZoomChange,
}: TimelineTransportProps) {
  const zoom = useVideoEditorStore(s => s.zoom)
  const aiComingSoon = useAiComingSoonOptional()

  return (
    <div
      data-preview-playback
      className="video-editor-transport flex min-w-0 shrink-0 items-center gap-1 overflow-x-auto border-b bg-background px-2 py-1 sm:gap-1.5 sm:px-2.5"
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" className="size-7" onClick={onAddText}>
              <TypeIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add text at playhead</TooltipContent>
        </Tooltip>

        {aiComingSoon ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7"
                onClick={() => aiComingSoon.open('auto-caption')}
              >
                <SparklesIcon className="size-3.5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto-caption (coming soon)</TooltipContent>
          </Tooltip>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-7"
              onClick={onSplit}
              disabled={!canSplit}
            >
              <ScissorsIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{canSplit ? 'Split at playhead' : 'Select a clip to split'}</TooltipContent>
        </Tooltip>

      </div>

      <div className="min-w-0 flex-1">
        <PreviewControls playback={playback} variant="transport" />
      </div>

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <div className="flex items-center gap-0.5">
          <TimelineZoomButton direction={-1}>
            <ZoomOutIcon className="size-3.5" />
          </TimelineZoomButton>
          <span className="w-11 text-center text-[10px] tabular-nums text-muted-foreground">{zoom}px/s</span>
          <TimelineZoomButton direction={1}>
            <ZoomInIcon className="size-3.5" />
          </TimelineZoomButton>
        </div>
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
        <VideoZoomControls
          zoom={previewZoom}
          onZoomChange={onPreviewZoomChange}
          className="shadow-none"
        />
      </div>
    </div>
  )
}
