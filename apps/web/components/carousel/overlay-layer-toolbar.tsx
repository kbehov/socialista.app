'use client'

import { ArrowDownIcon, ArrowUpIcon, CopyIcon, Maximize2Icon, Trash2Icon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { useActiveLayer } from '@/hooks/carousel/use-active-layer'
import { overlayFillColor } from '@/lib/carousel/overlay-style'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ColorPicker } from './primitives/color-picker'
import { cn } from '@/lib/utils'

const OVERLAY_PRESETS = [
  { label: 'Dark 40%', color: '#000000', opacity: 0.4 },
  { label: 'Dark 60%', color: '#000000', opacity: 0.6 },
  { label: 'Light 25%', color: '#ffffff', opacity: 0.25 },
] as const

export function SlideOverlaySection() {
  const { slide, layer } = useActiveLayer()
  const addOverlayLayer = useEditorStore(s => s.addOverlayLayer)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  if (!slide) return null

  if (!layer || layer.type !== 'overlay') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Overlay</Label>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Darken or tint the slide background so text stays readable.
        </p>
        <Button size="sm" variant="outline" className="w-full" onClick={() => addOverlayLayer(slide.id)}>
          Add overlay layer
        </Button>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Defaults to a full-slide black overlay at 40% opacity. Select an overlay on the canvas to edit it.
        </p>
      </div>
    )
  }

  const overlay = layer
  const previewColor = overlayFillColor(overlay.color, overlay.opacity)

  return (
    <div className="flex flex-col gap-2.5">
      <Label className="text-[11px] font-medium text-muted-foreground">Overlay</Label>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Drag to move, resize with handles, or cover the full slide. Reorder in the Layers tab.
      </p>

      <div
        className="mx-auto h-16 w-full max-w-[200px] rounded-md border shadow-xs"
        style={{ backgroundColor: previewColor }}
      />

      <div className="flex flex-wrap gap-1">
        {OVERLAY_PRESETS.map(preset => (
          <Button
            key={preset.label}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-[10px]"
            onClick={() =>
              updateLayer(slide.id, overlay.id, { color: preset.color, opacity: preset.opacity })
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Color</Label>
        <ColorPicker
          value={overlay.color}
          onChange={color => color && updateLayer(slide.id, overlay.id, { color })}
          allowNone={false}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">Opacity</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {Math.round(overlay.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(overlay.opacity * 100)}
          onChange={e =>
            updateLayer(slide.id, overlay.id, { opacity: Number(e.target.value) / 100 })
          }
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">Corner radius</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">{overlay.borderRadius ?? 0}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          value={overlay.borderRadius ?? 0}
          onChange={e => updateLayer(slide.id, overlay.id, { borderRadius: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() =>
            updateLayer(slide.id, overlay.id, { x: 0, y: 0, width: 100, height: 100, rotation: 0 })
          }
        >
          <Maximize2Icon className="size-3.5" />
          Cover full slide
        </Button>
        <div className="grid grid-cols-4 gap-1">
          <Button size="icon-sm" variant="outline" onClick={() => bringForward(slide.id, overlay.id)}>
            <ArrowUpIcon className="size-3.5" />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={() => sendBackward(slide.id, overlay.id)}>
            <ArrowDownIcon className="size-3.5" />
          </Button>
          <Button size="icon-sm" variant="outline" onClick={() => duplicateLayer(slide.id, overlay.id)}>
            <CopyIcon className="size-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            className={cn('text-destructive hover:bg-destructive/10')}
            onClick={() => removeLayer(slide.id, overlay.id)}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
