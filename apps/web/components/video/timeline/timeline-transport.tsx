'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PreviewControls } from '@/components/video/preview/preview-controls'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_LEVELS } from '@/lib/video/defaults'
import { fitZoomToProjectDuration } from '@/lib/video/timeline-zoom'
import { useVideoEditorStore } from '@/lib/video/store'
import { MagnetIcon, Redo2Icon, ScissorsIcon, TypeIcon, Undo2Icon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimecode } from '@/lib/video/timecode'
import { getVideoFormatPreset } from '@/lib/video/format-presets'

type Playback = {
  toggle: () => void
  seekTo: (time: number) => void
}

type TimelineTransportProps = {
  playback: Playback
  onAddText: () => void
  onSplit: () => void
  canSplit: boolean
}

export function TimelineTransport({
  playback,
  onAddText,
  onSplit,
  canSplit,
}: TimelineTransportProps) {
  const zoom = useVideoEditorStore(s => s.zoom)
  const setZoom = useVideoEditorStore(s => s.setZoom)
  const zoomIn = useVideoEditorStore(s => s.zoomIn)
  const zoomOut = useVideoEditorStore(s => s.zoomOut)
  const undo = useVideoEditorStore(s => s.undo)
  const redo = useVideoEditorStore(s => s.redo)
  const past = useVideoEditorStore(s => s.past)
  const future = useVideoEditorStore(s => s.future)
  const duration = useVideoEditorStore(s => s.project.duration)
  const durationGuide = useVideoEditorStore(s => s.durationGuide)
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const fps = useVideoEditorStore(s => s.project.fps)
  const snapEnabled = useVideoEditorStore(s => s.snapEnabled)
  const setSnapEnabled = useVideoEditorStore(s => s.setSnapEnabled)

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  const formatPreset = getVideoFormatPreset(formatPresetId)
  const guideExceeded = durationGuide != null && duration > durationGuide
  const durationPillLabel =
    durationGuide != null
      ? `${formatPreset?.label ?? 'Limit'} ≤ ${durationGuide}s — ${formatTimecode(duration, fps).slice(0, 5)}`
      : null

  const fitToProject = () => {
    setZoom(fitZoomToProjectDuration(duration))
  }

  const zoomLevelIndex = (() => {
    const exact = ZOOM_LEVELS.indexOf(zoom as (typeof ZOOM_LEVELS)[number])
    if (exact >= 0) return exact
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < ZOOM_LEVELS.length; i++) {
      const dist = Math.abs(ZOOM_LEVELS[i]! - zoom)
      if (dist < bestDist) {
        best = i
        bestDist = dist
      }
    }
    return best
  })()

  return (
    <div
      data-preview-playback
      className="video-editor-transport flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain border-b border-border/40 bg-background px-2 py-1 [scrollbar-width:thin] sm:px-2.5"
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2Icon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Undo <Kbd className="ml-1">⌘Z</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2Icon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Redo <Kbd className="ml-1">⌘⇧Z</Kbd>
          </TooltipContent>
        </Tooltip>

        <span className="mx-0.5 hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={onAddText}
            >
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
              className="video-studio-press size-7"
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
              className={cn(
                'video-studio-press size-7',
                snapEnabled && 'bg-primary/10 text-primary',
              )}
              onClick={() => setSnapEnabled(!snapEnabled)}
              aria-pressed={snapEnabled}
              aria-label={snapEnabled ? 'Disable snapping' : 'Enable snapping'}
            >
              <MagnetIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{snapEnabled ? 'Magnet snapping on' : 'Magnet snapping off'}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-1">
        <PreviewControls playback={playback} variant="transport" />
      </div>

      {durationPillLabel ? (
        <span
          className={cn(
            'hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] tabular-nums md:inline-flex',
            guideExceeded
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200'
              : 'border-border bg-muted/40 text-muted-foreground',
          )}
          title={
            guideExceeded
              ? `Project is longer than the ${durationGuide}s guide`
              : `Duration guide: ${durationGuide}s`
          }
        >
          {durationPillLabel}
        </span>
      ) : null}

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={() => zoomOut()}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom timeline out"
            >
              <ZoomOutIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <input
          type="range"
          min={0}
          max={ZOOM_LEVELS.length - 1}
          step={1}
          value={zoomLevelIndex}
          onChange={e => {
            const idx = Number(e.target.value)
            const level = ZOOM_LEVELS[idx]
            if (level !== undefined) setZoom(level)
          }}
          className="video-scrubber w-16 sm:w-20"
          aria-label="Timeline zoom"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7"
              onClick={() => zoomIn()}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom timeline in"
            >
              <ZoomInIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="video-studio-press h-7 px-2 text-[10px] text-muted-foreground"
              onClick={fitToProject}
            >
              Fit
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit timeline to project</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
