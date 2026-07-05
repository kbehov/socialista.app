'use client'

import { useEffect, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { exportProject, type AssetMap } from '@/lib/video/export'
import type { ExportQuality, ExportSettings } from '@socialista/types'
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

const RESOLUTION_PRESETS = [
  { id: '1080x1920', label: '1080×1920 (Reels)', width: 1080, height: 1920 },
  { id: '1080x1080', label: '1080×1080 (Square)', width: 1080, height: 1080 },
  { id: '1920x1080', label: '1920×1080 (Landscape)', width: 1920, height: 1080 },
] as const

const QUALITY_OPTIONS: { value: ExportQuality; label: string }[] = [
  { value: 'low', label: 'Low (smaller file)' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (best quality)' },
]

const FPS_OPTIONS = [24, 30, 60] as const

function resolutionToId(width: number, height: number): string {
  const match = RESOLUTION_PRESETS.find(p => p.width === width && p.height === height)
  return match?.id ?? RESOLUTION_PRESETS[0]!.id
}

function durationWarning(seconds: number): string | null {
  if (seconds > 600) return 'TikTok allows up to 10 minutes for most accounts.'
  if (seconds > 90) return 'Instagram Reels max length is 90 seconds.'
  return null
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
  const assets = useVideoEditorStore(s => s.assets)
  const exportProgress = useVideoEditorStore(s => s.exportProgress)
  const exportPhase = useVideoEditorStore(s => s.exportPhase)
  const setExportProgress = useVideoEditorStore(s => s.setExportProgress)

  const [resolutionId, setResolutionId] = useState(() =>
    resolutionToId(project.resolution.width, project.resolution.height),
  )
  const [quality, setQuality] = useState<ExportQuality>('medium')
  const [fps, setFps] = useState<number>(project.fps)
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const runningRef = useRef(false)
  const resultUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current)
      }
    }
  }, [])

  const revokeResultUrl = () => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = null
    }
    setResultUrl(null)
  }

  const preset = RESOLUTION_PRESETS.find(p => p.id === resolutionId) ?? RESOLUTION_PRESETS[0]!
  const settings: ExportSettings = {
    resolution: { width: preset.width, height: preset.height },
    fps,
    quality,
  }

  const handleExport = async () => {
    if (runningRef.current) return
    runningRef.current = true
    setError(null)
    revokeResultUrl()
    setExportProgress(0, 'Starting')
    try {
      const blob = await exportProject(project, assets as AssetMap, settings, (progress, phase) => {
        setExportProgress(progress, phase)
      })
      const url = URL.createObjectURL(blob)
      resultUrlRef.current = url
      setResultUrl(url)
      setExportProgress(1, 'Done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setExportProgress(null, null)
    } finally {
      runningRef.current = false
    }
  }

  const isRunning = exportProgress !== null && exportProgress < 1 && !error
  const percent = exportProgress ? Math.round(exportProgress * 100) : 0
  const warning = durationWarning(project.duration)

  const handleClose = () => {
    if (isRunning) return
    revokeResultUrl()
    onClose()
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Export video</DialogTitle>
        <DialogDescription>
          Export your timeline as an MP4. Settings default to your project format.
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
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              download={`${project.name || 'video'}.mp4`}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
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
