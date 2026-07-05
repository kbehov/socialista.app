'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useVideoEditorStore } from '@/lib/video/store'
import { useVideoShortcuts } from '@/hooks/video/use-video-shortcuts'
import { formatTimecode } from '@/lib/video/timecode'
import { DownloadIcon, Loader2Icon, Redo2Icon, ScissorsIcon, SparklesIcon, TypeIcon, Undo2Icon } from 'lucide-react'
import { ClipAiProvider, useClipAi } from '@/components/video/ai/clip-ai-provider'
import { PreviewCanvas } from './preview/preview-canvas'
import { Timeline } from './timeline/timeline'
import { PropertiesPanel } from './inspector/properties-panel'
import { ExportModal } from './export/export-modal'
import { cn } from '@/lib/utils'

export function VideoEditor() {
  return (
    <ClipAiProvider>
      <VideoEditorContent />
    </ClipAiProvider>
  )
}

function VideoEditorContent() {
  useVideoShortcuts()
  const undo = useVideoEditorStore(s => s.undo)
  const redo = useVideoEditorStore(s => s.redo)
  const past = useVideoEditorStore(s => s.past)
  const future = useVideoEditorStore(s => s.future)
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const { openClipAi, canUseClipAi, getClipAiMode, isProcessingClip } = useClipAi()
  const [exportOpen, setExportOpen] = useState(false)

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  const canSplit = Boolean(selectedClipId || selectedOverlayId)
  const canExport = duration > 0
  const clipAiMode = selectedClipId ? getClipAiMode(selectedClipId) : null
  const canUseAi = selectedClipId ? canUseClipAi(selectedClipId) : false
  const isAiProcessing = selectedClipId ? isProcessingClip(selectedClipId) : false
  const aiLabel = clipAiMode === 'animate-image' ? 'Animate with AI' : 'Edit with AI'

  const handleSplit = () => {
    if (selectedClipId) {
      splitClip(selectedClipId, playhead)
    } else if (selectedOverlayId) {
      splitOverlay(selectedOverlayId, playhead)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-1.5 border-b bg-muted/15 px-2.5 py-1.5 sm:px-3">
        <div className="flex items-center rounded-md border border-border/50 bg-background/60 p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" onClick={undo} disabled={!canUndo} aria-label="Undo">
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd className="ml-1">⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" onClick={redo} disabled={!canRedo} aria-label="Redo">
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd className="ml-1">⌘⇧Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-background/60"
          onClick={() => {
            const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
            addTextOverlay(playhead, Math.max(playhead + 0.5, end))
          }}
        >
          <TypeIcon />
          <span className="hidden sm:inline">Add text</span>
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-background/60"
              onClick={handleSplit}
              disabled={!canSplit}
              aria-label="Split at playhead"
            >
              <ScissorsIcon />
              <span className="hidden sm:inline">Split</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Split at playhead <Kbd className="ml-1">S</Kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-background/60"
              onClick={() => selectedClipId && openClipAi(selectedClipId)}
              disabled={!canUseAi || isAiProcessing}
              aria-label={aiLabel}
            >
              {isAiProcessing ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
              <span className="hidden sm:inline">{isAiProcessing ? 'Generating…' : aiLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!selectedClipId
              ? 'Select a video or image clip on the timeline'
              : !canUseAi
                ? 'Re-link clip media to use AI'
                : clipAiMode === 'animate-image'
                  ? 'Generate a short video from the selected image'
                  : 'Edit the selected video clip with a text prompt'}
          </TooltipContent>
        </Tooltip>

        <div className="hidden flex-1 md:block" />

        <p className="hidden min-w-0 flex-1 truncate text-[11px] text-muted-foreground lg:block">
          Drag clips to trim · <Kbd>S</Kbd> split · <Kbd>Space</Kbd> play
        </p>

        <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-background/60 py-0.5 pr-0.5 pl-2 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums text-foreground">{formatTimecode(playhead, fps)}</span>
          <span className="text-border">/</span>
          <span className="font-mono tabular-nums">{formatTimecode(duration, fps)}</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button size="sm" className="h-8" onClick={() => setExportOpen(true)} disabled={!canExport}>
                <DownloadIcon />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </span>
          </TooltipTrigger>
          {!canExport ? (
            <TooltipContent>Import media to the timeline before exporting</TooltipContent>
          ) : (
            <TooltipContent>Export MP4</TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,260px)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_280px] lg:grid-rows-1">
        <div className="min-h-0 min-w-0 overflow-hidden">
          <PreviewCanvas />
        </div>
        <div className="flex h-full min-h-0 flex-col overflow-hidden border-t bg-card lg:border-t-0 lg:border-l">
          <PropertiesPanel />
        </div>
      </div>

      <div className={cn('h-[280px] shrink-0 border-t bg-card')}>
        <Timeline />
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
