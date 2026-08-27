'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { getVideoFormatPreset } from '@/lib/video/format-presets'
import { focusVideoFormatSelector } from '@/lib/video/editor-events'
import { EditorPanelSection } from '@/components/editor/panel-shell'
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
    <div className="flex flex-col gap-5">
      <EditorPanelSection title="Name">
        <Input
          id="project-name"
          value={name}
          onChange={e => setProjectName(e.target.value)}
          className="h-7 text-xs font-medium"
        />
      </EditorPanelSection>

      <EditorPanelSection title="Format">
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/20 px-2.5 py-2">
          {formatPreset ? (
            <>
              <PlatformIcon platform={formatPreset.platform} size={14} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium tracking-tight">{formatPreset.label}</p>
                <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {resolution.width}×{resolution.height}
                </p>
              </div>
            </>
          ) : (
            <p className="text-[12px] tabular-nums text-muted-foreground">
              {resolution.width}×{resolution.height}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full text-[12px] font-medium"
          onClick={() => focusVideoFormatSelector()}
        >
          Change format
        </Button>
      </EditorPanelSection>

      <EditorPanelSection title="Frame rate">
        <Select value={String(fps)} onValueChange={v => setFps(parseInt(v, 10))}>
          <SelectTrigger className="h-7 w-full text-xs">
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
      </EditorPanelSection>

      <EditorPanelSection
        title="Target length"
        description="Shows a marker on the timeline ruler. Visual only."
      >
        <Select
          value={guideValue}
          onValueChange={v => setDurationGuide(v === 'none' ? null : parseInt(v, 10))}
        >
          <SelectTrigger className="h-7 w-full text-xs">
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
      </EditorPanelSection>

      <p className="text-[11px] text-muted-foreground">
        Duration{' '}
        <span className="font-medium tabular-nums text-foreground">{duration.toFixed(2)}s</span>
      </p>
    </div>
  )
}
