'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import type { CanvasDimensions } from '@socialista/types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const RESOLUTION_PRESETS: { id: string; label: string; dimensions: CanvasDimensions }[] = [
  { id: 'vertical', label: '1080×1920 (Reels)', dimensions: { width: 1080, height: 1920 } },
  { id: 'square', label: '1080×1080 (Square)', dimensions: { width: 1080, height: 1080 } },
  { id: 'landscape', label: '1920×1080 (Landscape)', dimensions: { width: 1920, height: 1080 } },
]

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
  const setProjectName = useVideoEditorStore(s => s.setProjectName)
  const setResolution = useVideoEditorStore(s => s.setResolution)
  const setFps = useVideoEditorStore(s => s.setFps)
  const setDurationGuide = useVideoEditorStore(s => s.setDurationGuide)

  const matchedPreset = RESOLUTION_PRESETS.find(
    p => p.dimensions.width === resolution.width && p.dimensions.height === resolution.height,
  )

  const guideValue = durationGuide == null ? 'none' : String(durationGuide)

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-semibold uppercase text-muted-foreground">Project</div>

      <div className="space-y-1.5">
        <Label htmlFor="project-name" className="text-xs text-muted-foreground">
          Name
        </Label>
        <Input
          id="project-name"
          value={name}
          onChange={e => setProjectName(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Resolution</Label>
        <Select
          value={matchedPreset?.id ?? 'custom'}
          onValueChange={id => {
            const preset = RESOLUTION_PRESETS.find(p => p.id === id)
            if (preset) setResolution(preset.dimensions)
          }}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOLUTION_PRESETS.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
            {!matchedPreset ? (
              <SelectItem value="custom">
                Custom ({resolution.width}×{resolution.height})
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
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
        <Label className="text-xs text-muted-foreground">Duration guide</Label>
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
