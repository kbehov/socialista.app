'use client'

import { useEffect, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { getVideoFormatPreset, VIDEO_FORMAT_PRESETS } from '@/lib/video/format-presets'
import { useVideoSave } from '@/hooks/video/use-video-save'
import { useGenerationRun } from '@/hooks/use-generation-run'
import { exportVideo as exportVideoRequest } from '@/services/video.service'
import type { ExportQuality, ExportSettings, VideoExportOutput } from '@socialista/types'
import { DownloadIcon, Loader2Icon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const RESOLUTION_PRESETS = (() => {
  const seen = new Set<string>()
  const presets: { id: string; label: string; width: number; height: number }[] = []
  for (const preset of VIDEO_FORMAT_PRESETS) {
    const { width, height } = preset.dimensions
    const id = `${width}x${height}`
    if (seen.has(id)) continue
    seen.add(id)
    const orientation = height > width ? 'Vertical' : width > height ? 'Landscape' : 'Square'
    presets.push({
      id,
      label: `${width}×${height} (${orientation})`,
      width,
      height,
    })
  }
  return presets
})()

const QUALITY_OPTIONS: { value: ExportQuality; label: string }[] = [
  { value: 'low', label: 'Low (smaller file)' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (best quality)' },
]

function recommendedQuality(presetId: string): ExportQuality {
  const preset = getVideoFormatPreset(presetId)
  if (!preset) return 'medium'
  if (preset.dimensions.height > preset.dimensions.width) return 'high'
  return 'medium'
}

function qualityHint(presetId: string, quality: ExportQuality): string | null {
  const recommended = recommendedQuality(presetId)
  if (quality !== recommended) return null
  const preset = getVideoFormatPreset(presetId)
  if (!preset) return null
  return `Recommended for ${preset.platform}`
}

const FPS_OPTIONS = [24, 30, 60] as const

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

function resolutionToId(width: number, height: number): string {
  const id = `${width}x${height}`
  const match = RESOLUTION_PRESETS.find(p => p.id === id)
  return match?.id ?? RESOLUTION_PRESETS[0]!.id
}

function durationWarning(seconds: number): string | null {
  if (seconds > 600) return 'TikTok allows up to 10 minutes for most accounts.'
  if (seconds > 90) return 'Instagram Reels max length is 90 seconds.'
  return null
}

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'video'
  )
}

function buildExportFilename(projectName: string, presetId: string, width: number, height: number): string {
  const preset = getVideoFormatPreset(presetId)
  const platform = (preset?.platform ?? 'export').toLowerCase().replace(/\s+/g, '')
  const ratio = height > width ? '9x16' : width > height ? '16x9' : '1x1'
  return `${slugify(projectName)}-${platform}-${ratio}.mp4`
}

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) onClose()
      }}
    >
      {open ? <ExportModalBody onClose={onClose} /> : null}
    </Dialog>
  )
}

function ExportModalBody({ onClose }: { onClose: () => void }) {
  const project = useVideoEditorStore(s => s.project)
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const exportProgress = useVideoEditorStore(s => s.exportProgress)
  const exportPhase = useVideoEditorStore(s => s.exportPhase)
  const setExportProgress = useVideoEditorStore(s => s.setExportProgress)
  const { save } = useVideoSave()

  const [resolutionId, setResolutionId] = useState(() =>
    resolutionToId(project.resolution.width, project.resolution.height),
  )
  const [quality, setQuality] = useState<ExportQuality>(() => recommendedQuality(formatPresetId))
  const [fps, setFps] = useState<number>(project.fps)
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const runningRef = useRef(false)
  const completedRef = useRef(false)

  const { run, error: runHookError } = useGenerationRun({
    runId: runId ?? '',
    accessToken,
  })

  useEffect(() => {
    if (!runId || !run || completedRef.current) return

    const statusMeta = run.metadata?.status as { progress?: number; label?: string } | undefined
    if (typeof statusMeta?.progress === 'number') {
      setExportProgress(statusMeta.progress / 100, statusMeta.label ?? 'Working…')
    }

    const errorMeta = run.metadata?.error as { message?: string } | undefined
    if (run.status && TERMINAL_FAIL.has(run.status)) {
      completedRef.current = true
      const message =
        errorMeta?.message ??
        (runHookError instanceof Error ? runHookError.message : null) ??
        'Export failed'
      setError(message)
      setExportProgress(null, null)
      runningRef.current = false
      return
    }

    if (run.status === 'COMPLETED') {
      completedRef.current = true
      const output = run.output as VideoExportOutput | undefined
      if (output?.videoUrl) {
        setResultUrl(output.videoUrl)
        setExportProgress(1, 'Done')
      } else {
        setError('Export completed but no video URL was returned')
        setExportProgress(null, null)
      }
      runningRef.current = false
    }
  }, [run, runId, runHookError, setExportProgress])

  const preset = RESOLUTION_PRESETS.find(p => p.id === resolutionId) ?? RESOLUTION_PRESETS[0]!
  const settings: ExportSettings = {
    resolution: { width: preset.width, height: preset.height },
    fps,
    quality,
  }
  const filename = buildExportFilename(project.name, formatPresetId, preset.width, preset.height)
  const qualityRecommendation = qualityHint(formatPresetId, quality)

  const handleExport = async () => {
    if (runningRef.current) return
    runningRef.current = true
    completedRef.current = false
    setError(null)
    setResultUrl(null)
    setRunId(null)
    setAccessToken(null)
    setExportProgress(0, 'Saving draft')

    try {
      const saved = await save({ silent: true })
      if (!saved) {
        setError('Save your video before exporting')
        setExportProgress(null, null)
        runningRef.current = false
        return
      }

      // Re-read project id after save (first save may assign a real id)
      const videoId = useVideoEditorStore.getState().project.id
      if (!videoId || videoId.startsWith('project_')) {
        setError('Save your video before exporting')
        setExportProgress(null, null)
        runningRef.current = false
        return
      }

      setExportProgress(0.02, 'Starting export')
      const response = await exportVideoRequest(videoId, settings)
      if (!response.success || !response.data) {
        setError(response.message ?? 'Failed to start export')
        setExportProgress(null, null)
        runningRef.current = false
        return
      }

      setRunId(response.data.runId)
      setAccessToken(response.data.publicAccessToken)
      setExportProgress(0.05, 'Queued')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setExportProgress(null, null)
      runningRef.current = false
    }
  }

  const isRunning = Boolean(runId && !resultUrl && !error) || (exportProgress !== null && exportProgress < 1 && !error && !resultUrl)
  const percent = exportProgress != null ? Math.round(exportProgress * 100) : 0
  const warning = durationWarning(project.duration)

  const handleClose = () => {
    if (isRunning) return
    onClose()
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Export video</DialogTitle>
        <DialogDescription>
          Export your timeline as an MP4. Encoding runs on our servers for faster results.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Resolution</Label>
          <Select value={resolutionId} onValueChange={setResolutionId} disabled={isRunning}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTION_PRESETS.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">FPS</Label>
          <Select value={String(fps)} onValueChange={v => setFps(parseInt(v, 10))} disabled={isRunning}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FPS_OPTIONS.map(f => (
                <SelectItem key={f} value={String(f)}>
                  {f} fps
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Quality</Label>
          <Select value={quality} onValueChange={v => setQuality(v as ExportQuality)} disabled={isRunning}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map(q => (
                <SelectItem key={q.value} value={q.value}>
                  {q.label}
                  {q.value === recommendedQuality(formatPresetId) ? ' · Recommended' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {qualityRecommendation ? (
            <p className="text-[11px] text-muted-foreground">{qualityRecommendation}</p>
          ) : null}
        </div>

        <p className="truncate rounded-md border bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
          {filename}
        </p>

        {warning ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-800 dark:text-amber-200">
            {warning}
          </p>
        ) : null}

        {isRunning ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>{exportPhase ?? 'Working…'}</span>
              <span className="ml-auto font-mono tabular-nums">{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {resultUrl ? (
          <div className="flex flex-col gap-2">
            <video src={resultUrl} controls className="w-full rounded-md border" />
            <a
              href={resultUrl}
              download={filename}
              className="video-studio-press flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              <DownloadIcon className="h-4 w-4" /> Download MP4
            </a>
          </div>
        ) : null}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={isRunning}>
          {resultUrl ? 'Close' : 'Cancel'}
        </Button>
        {!resultUrl ? (
          <Button type="button" onClick={() => void handleExport()} disabled={isRunning}>
            {isRunning ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
            Export
          </Button>
        ) : null}
      </DialogFooter>
    </DialogContent>
  )
}
