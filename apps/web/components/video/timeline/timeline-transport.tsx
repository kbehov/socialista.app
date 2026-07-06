'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PreviewControls } from '@/components/video/preview/preview-controls'
import { useVideoEditorStore } from '@/lib/video/store'
import { Loader2Icon, ScissorsIcon, SparklesIcon, TypeIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'

type Playback = {
  toggle: () => void
  seekTo: (time: number) => void
}

type TimelineTransportProps = {
  playback: Playback
  onAddText: () => void
  onSplit: () => void
  onOpenAi: () => void
  canSplit: boolean
  canUseAi: boolean
  isAiProcessing: boolean
  aiLabel: string
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
  onOpenAi,
  canSplit,
  canUseAi,
  isAiProcessing,
  aiLabel,
}: TimelineTransportProps) {
  const zoom = useVideoEditorStore(s => s.zoom)

  return (
    <div
      data-preview-playback
      className="video-editor-transport flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b px-2 py-1.5 sm:gap-2 sm:px-3"
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" className="size-8" onClick={onAddText}>
              <TypeIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add text at playhead</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-8"
              onClick={onSplit}
              disabled={!canSplit}
            >
              <ScissorsIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{canSplit ? 'Split at playhead' : 'Select a clip to split'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-8"
              onClick={onOpenAi}
              disabled={!canUseAi || isAiProcessing}
            >
              {isAiProcessing ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <SparklesIcon className="size-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isAiProcessing ? 'Generating…' : aiLabel}</TooltipContent>
        </Tooltip>
      </div>

      <div className="min-w-0 flex-1">
        <PreviewControls playback={playback} variant="transport" />
      </div>

      <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
        <TimelineZoomButton direction={-1}>
          <ZoomOutIcon className="size-3.5" />
        </TimelineZoomButton>
        <span className="w-12 text-center text-[11px] tabular-nums text-muted-foreground">{zoom}px/s</span>
        <TimelineZoomButton direction={1}>
          <ZoomInIcon className="size-3.5" />
        </TimelineZoomButton>
      </div>
    </div>
  )
}
