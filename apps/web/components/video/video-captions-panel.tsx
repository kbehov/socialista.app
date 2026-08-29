'use client'

import { useVideoSave } from '@/hooks/video/use-video-save'
import { useGenerationRun } from '@/hooks/use-generation-run'
import {
  EditorPanelHeader,
  EditorPanelScrollArea,
  EditorPanelSection,
} from '@/components/editor/panel-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CAPTION_OVERLAY_PRESET } from '@/lib/video/defaults'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatTimecode } from '@/lib/video/timecode'
import { generateVideoCaptions } from '@/services/video.service'
import { formatCredits } from '@/utils/format'
import type { Clip, GenerateVideoCaptionsOutput, VideoCaptionSegment } from '@socialista/types'
import { VIDEO_CAPTIONS_CREDIT_COST } from '@socialista/types'
import { ArrowLeftIcon, CaptionsIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const TERMINAL_FAIL = new Set([
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

type PanelView = 'input' | 'preview'

type CaptionClipOption = {
  id: string
  label: string
  clip: Clip
}

function formatDurationShort(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function captionClipsFromProject(
  clips: Record<string, Clip>,
  assets: { id: string; name: string }[],
  fps: number,
): CaptionClipOption[] {
  const assetsById = new Map(assets.map(asset => [asset.id, asset]))
  return Object.values(clips)
    .filter(clip => clip.type === 'video' || clip.type === 'audio')
    .toSorted((a, b) => a.startTime - b.startTime)
    .map(clip => {
      const assetName = assetsById.get(clip.assetId)?.name ?? 'Untitled clip'
      return {
        id: clip.id,
        label: `${assetName} · ${formatTimecode(clip.startTime, fps)} (${formatDurationShort(clip.duration)})`,
        clip,
      }
    })
}

function toTimelineOverlay(
  clip: Clip,
  segment: VideoCaptionSegment,
): { content: string; startTime: number; endTime: number } | null {
  const clipStart = clip.startTime
  const clipEnd = clip.startTime + clip.duration
  const startTime = clipStart + segment.startTime
  const endTime = clipStart + segment.endTime
  const clampedStart = Math.max(clipStart, startTime)
  const clampedEnd = Math.min(clipEnd, endTime)
  if (clampedEnd - clampedStart < 0.05) return null
  return { content: segment.text, startTime: clampedStart, endTime: clampedEnd }
}

export function VideoCaptionsPanel({
  embedded = false,
  showPanelHeader = true,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const project = useVideoEditorStore(s => s.project)
  const fps = project.fps
  const addTextOverlays = useVideoEditorStore(s => s.addTextOverlays)
  const seek = useVideoEditorStore(s => s.seek)
  const { save } = useVideoSave({ autosave: false })

  const clipOptions = useMemo(
    () => captionClipsFromProject(project.clips, project.assets, fps),
    [project.assets, project.clips, fps],
  )

  const [view, setView] = useState<PanelView>('input')
  const [selectedClipId, setSelectedClipId] = useState<string>('')
  const [segments, setSegments] = useState<VideoCaptionSegment[]>([])
  const [language, setLanguage] = useState('en')
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [runId, setRunId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [consumedRunId, setConsumedRunId] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState<number | null>(null)
  const [localLabel, setLocalLabel] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const toastedRunIdRef = useRef<string | null>(null)

  const selectedClipIdResolved = clipOptions.some(option => option.id === selectedClipId)
    ? selectedClipId
    : (clipOptions[0]?.id ?? '')

  const { run, error: runHookError } = useGenerationRun({
    runId: runId ?? '',
    accessToken,
  })

  const statusMeta = run?.metadata?.status as { progress?: number; label?: string } | undefined
  const errorMeta = run?.metadata?.error as { message?: string } | undefined
  const progress = typeof statusMeta?.progress === 'number' ? statusMeta.progress : localProgress
  const progressLabel = statusMeta?.label ?? localLabel
  const runFailed = Boolean(run?.status && TERMINAL_FAIL.has(run.status))
  const runCompleted = run?.status === 'COMPLETED'
  const output = runCompleted ? (run?.output as GenerateVideoCaptionsOutput | undefined) : undefined

  if (runId && consumedRunId !== runId && (runFailed || runCompleted)) {
    setConsumedRunId(runId)
    setStarting(false)
    setLocalProgress(null)
    setLocalLabel(null)
    if (runCompleted && output?.segments.length) {
      setLanguage(output.language || 'en')
      setSegments(output.segments)
      setView('preview')
    }
  }

  const isRunning = starting || (Boolean(runId) && consumedRunId !== runId)

  useEffect(() => {
    if (!runId || consumedRunId !== runId || toastedRunIdRef.current === runId) return

    if (runFailed) {
      toastedRunIdRef.current = runId
      toast.error(
        errorMeta?.message ??
          (runHookError instanceof Error ? runHookError.message : null) ??
          'Caption generation failed',
      )
      return
    }

    if (runCompleted) {
      toastedRunIdRef.current = runId
      if (!output?.segments.length) {
        toast.error('No captions were returned')
        return
      }
      toast.success(`Generated ${output.segments.length} caption${output.segments.length === 1 ? '' : 's'}`)
    }
  }, [consumedRunId, errorMeta?.message, output?.segments.length, runCompleted, runFailed, runHookError, runId])

  const resetRunUi = useCallback(() => {
    setRunId(null)
    setAccessToken(null)
    setConsumedRunId(null)
    setLocalProgress(null)
    setLocalLabel(null)
    setStarting(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (starting || isRunning) return
    if (!selectedClipIdResolved) {
      toast.error('Add a video clip with audio first')
      return
    }

    toastedRunIdRef.current = null
    setConsumedRunId(null)
    setStarting(true)
    setLocalProgress(2)
    setLocalLabel('Saving draft')
    setRunId(null)
    setAccessToken(null)

    try {
      const saved = await save({ silent: true })
      if (!saved) {
        toast.error('Save your video before generating captions')
        resetRunUi()
        return
      }

      const videoId = useVideoEditorStore.getState().project.id
      if (!videoId || videoId.startsWith('project_')) {
        toast.error('Save your video before generating captions')
        resetRunUi()
        return
      }

      setLocalLabel('Starting transcription')
      const response = await generateVideoCaptions(videoId, selectedClipIdResolved)
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Failed to start caption generation')
        resetRunUi()
        return
      }

      setRunId(response.data.runId)
      setAccessToken(response.data.publicAccessToken)
      setLocalProgress(5)
      setLocalLabel('Queued')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate captions')
      resetRunUi()
    }
  }, [isRunning, resetRunUi, save, selectedClipIdResolved, starting])

  const updateSegment = useCallback((index: number, partial: Partial<VideoCaptionSegment>) => {
    setSegments(prev => prev.map((segment, i) => (i === index ? { ...segment, ...partial } : segment)))
  }, [])

  const handleApply = useCallback(() => {
    if (segments.length === 0) {
      toast.error('Nothing to apply')
      return
    }

    const clip = useVideoEditorStore.getState().project.clips[selectedClipIdResolved]
    if (!clip) {
      toast.error('The selected clip is no longer on the timeline')
      return
    }

    const batch = segments.flatMap(segment => {
      const mapped = toTimelineOverlay(clip, segment)
      if (!mapped) return []
      return [
        {
          ...mapped,
          x: CAPTION_OVERLAY_PRESET.x,
          y: CAPTION_OVERLAY_PRESET.y,
          width: CAPTION_OVERLAY_PRESET.width,
          style: CAPTION_OVERLAY_PRESET.style,
        },
      ]
    })

    if (batch.length === 0) {
      toast.error('None of the captions overlap this clip')
      return
    }

    const ids = addTextOverlays(batch, { replaceExisting })
    const first = batch[0]
    if (first) seek(first.startTime)

    toast.success(
      replaceExisting
        ? `Replaced timeline text with ${ids.length} caption${ids.length === 1 ? '' : 's'}`
        : `Applied ${ids.length} caption${ids.length === 1 ? '' : 's'}`,
    )
  }, [addTextOverlays, replaceExisting, seek, segments, selectedClipIdResolved])

  const percent = progress != null ? Math.round(progress) : 0
  const canGenerate = clipOptions.length > 0 && Boolean(selectedClipIdResolved) && !isRunning

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      {showPanelHeader ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
          <EditorPanelHeader
            title="Captions"
            description="Captions appear one short phrase at a time"
          />
        </div>
      ) : null}

      {view === 'input' ? (
        <>
          <EditorPanelScrollArea contentClassName="gap-5 p-3.5 pb-4">
            <EditorPanelSection
              title="Clip"
              description="Each line is timed to the speech — like TikTok captions"
            >
              {clipOptions.length === 0 ? (
                <div className="rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5">
                  <p className="text-[12px] text-muted-foreground">
                    Add a video or audio clip with speech to the timeline first.
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedClipIdResolved}
                  onValueChange={setSelectedClipId}
                  disabled={isRunning}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg text-[12px]">
                    <SelectValue placeholder="Select a clip" />
                  </SelectTrigger>
                  <SelectContent>
                    {clipOptions.map(option => (
                      <SelectItem key={option.id} value={option.id} className="text-[12px]">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </EditorPanelSection>
          </EditorPanelScrollArea>

          <div className="shrink-0 space-y-2 border-t border-border/40 bg-background/80 p-3.5 backdrop-blur-sm">
            {isRunning ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
                  <span>{progressLabel ?? 'Working…'}</span>
                  <span className="ml-auto font-mono tabular-nums text-muted-foreground">{percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                </div>
              </div>
            ) : (
              <Button
                className="h-9 w-full gap-2 rounded-lg text-[12px] font-medium tracking-tight shadow-xs"
                onClick={() => void handleGenerate()}
                disabled={!canGenerate}
              >
                <CaptionsIcon className="size-3.5" strokeWidth={2} />
                Generate captions
              </Button>
            )}
            <p className="px-0.5 text-[10px] tracking-wide text-muted-foreground/75">
              ≈ {formatCredits(VIDEO_CAPTIONS_CREDIT_COST)} credits per generation
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="shrink-0 border-b border-border/40 px-3 py-2">
            <button
              type="button"
              onClick={() => setView('input')}
              className="flex items-center gap-1.5 rounded-md px-1 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ArrowLeftIcon className="size-3" strokeWidth={2} />
              Back
            </button>
            <p className="mt-1 truncate px-1 text-[13px] font-semibold tracking-tight text-foreground">
              Generated captions
            </p>
            <p className="px-1 text-[11px] text-muted-foreground">
              {segments.length} caption{segments.length === 1 ? '' : 's'}
              {language ? ` · ${language}` : ''} · edit before applying
            </p>
          </div>

          <EditorPanelScrollArea contentClassName="gap-2.5 p-3 pb-4">
            {segments.map((segment, index) => (
              <div
                key={`${segment.startTime}-${index}`}
                className="rounded-xl border border-border/40 bg-muted/10 p-2.5"
              >
                <div className="mb-2 flex items-center justify-end">
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {formatTimecode(segment.startTime, fps)} – {formatTimecode(segment.endTime, fps)}
                  </span>
                </div>
                <Textarea
                  value={segment.text}
                  rows={2}
                  onChange={e => updateSegment(index, { text: e.target.value })}
                  className="min-h-0 resize-none rounded-lg border-border/40 bg-background/80 px-2.5 py-2 text-[12px] leading-snug shadow-none"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Label className="sr-only" htmlFor={`caption-start-${index}`}>
                    Start time
                  </Label>
                  <Input
                    id={`caption-start-${index}`}
                    type="number"
                    min={0}
                    step={0.1}
                    value={segment.startTime}
                    onChange={e => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next)) return
                      updateSegment(index, { startTime: Math.max(0, next) })
                    }}
                    className="h-7 w-18 px-2 text-[11px] tabular-nums"
                    aria-label={`Caption ${index + 1} start seconds`}
                  />
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={segment.endTime}
                    onChange={e => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next)) return
                      updateSegment(index, { endTime: Math.max(0, next) })
                    }}
                    className="h-7 w-18 px-2 text-[11px] tabular-nums"
                    aria-label={`Caption ${index + 1} end seconds`}
                  />
                  <span className="text-[10px] text-muted-foreground">s</span>
                </div>
              </div>
            ))}
          </EditorPanelScrollArea>

          <div className="shrink-0 space-y-2.5 border-t border-border/40 bg-background/80 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <Label
                htmlFor="replace-caption-overlays"
                className="text-[11px] leading-snug font-normal text-muted-foreground"
              >
                Replace existing text overlays
              </Label>
              <Switch
                id="replace-caption-overlays"
                size="sm"
                checked={replaceExisting}
                onCheckedChange={setReplaceExisting}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-9 flex-1 rounded-lg text-[12px] font-medium"
                disabled={isRunning}
                onClick={() => {
                  setView('input')
                  void handleGenerate()
                }}
              >
                Regenerate
              </Button>
              <Button
                className="h-9 flex-1 rounded-lg text-[12px] font-medium shadow-xs"
                onClick={handleApply}
                disabled={segments.length === 0}
              >
                Apply to timeline
              </Button>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
