'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { getVideoFormatPreset } from '@/lib/video/format-presets'
import { focusVideoFormatSelector } from '@/lib/video/editor-events'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/carousel/format-selector'

const FPS_OPTIONS = [24, 30, 60]

const DURATION_GUIDES = [
  { value: 'none', label: 'No guide' },
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '60 seconds' },
  { value: '90', label: '90 seconds (IG Reels max)' },
] as const

export function ProjectProperties() {
  const name = useVideoEditorStore(s => s.project.name)
  const resolution = useVideoEditorStore(s => s.project.resolution)
  const fps = useVideoEditorStore(s => s.project.fps)
  const duration = useVideoEditorStore(s => s.project.duration)
  const durationGuide = useVideoEditorStore(s => s.durationGuide)
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const setProjectName = useVideoEditorStore(s => s.setProjectName)
  const setFps = useVideoEditorStore(s => s.setFps)
  const setDurationGuide = useVideoEditorStore(s => s.setDurationGuide)

  const formatPreset = getVideoFormatPreset(formatPresetId)
  const guideValue = durationGuide == null ? 'none' : String(durationGuide)

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">Project</div>

      <div className="space-y-1.5">
        <Label htmlFor="project-name" className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">
          Name
        </Label>
        <Input
          id="project-name"
          value={name}
          onChange={e => setProjectName(e.target.value)}
          className="h-7 text-xs font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Format</Label>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/15 px-2.5 py-2">
          {formatPreset ? (
            <>
              <PlatformIcon platform={formatPreset.platform} size={16} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{formatPreset.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {resolution.width}×{resolution.height}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {resolution.width}×{resolution.height}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="video-studio-press h-7 w-full text-xs"
          onClick={() => focusVideoFormatSelector()}
        >
          Change format
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">FPS</Label>
        <Select value={String(fps)} onValueChange={v => setFps(parseInt(v, 10))}>
          <SelectTrigger className="h-8 w-full">
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
        <Label className="text-xs text-muted-foreground">Target length</Label>
        <Select
          value={guideValue}
          onValueChange={v => setDurationGuide(v === 'none' ? null : parseInt(v, 10))}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_GUIDES.map(g => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">Shows a marker on the timeline ruler (visual only).</p>
      </div>

      <div className="text-xs text-muted-foreground">
        Duration: <span className="font-mono text-foreground">{duration.toFixed(2)}s</span>
      </div>
    </div>
  )
}
